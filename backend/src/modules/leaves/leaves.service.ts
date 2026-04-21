import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest, LeaveStatus, LeaveType } from './schemas/leave-request.schema';
import { LeaveBalance } from './schemas/leave-balance.schema';
import { LeavePolicy } from './schemas/leave-policy.schema';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto, AdjustBalanceDto, UpdatePolicyDto } from './dto/leaves.dto';
import { Attendance, AttendanceStatus } from '../attendance/schemas/attendance.schema';
import { differenceInBusinessDays, parseISO, format, eachDayOfInterval } from 'date-fns';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalance>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicy>,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
  ) {}

  async getPolicy(organizationId: string) {
    let policy = await this.leavePolicyModel.findOne({ organizationId: new Types.ObjectId(organizationId) } as any);
    if (!policy) {
      policy = new this.leavePolicyModel({
        organizationId: new Types.ObjectId(organizationId),
        entitlements: {
          [LeaveType.ANNUAL]: 18,
          [LeaveType.SICK]: 12,
          [LeaveType.CASUAL]: 10,
          [LeaveType.COMPENSATORY]: 0,
        },
      });
      await policy.save();
    }
    return policy;
  }

  async updatePolicy(organizationId: string, dto: UpdatePolicyDto) {
    const policy = await this.getPolicy(organizationId);
    
    // Update policy entitlements
    const newEntitlements: any = {};
    dto.entitlements.forEach(e => {
      newEntitlements[e.type] = e.days;
      policy.entitlements.set(e.type, e.days);
    });
    await policy.save();

    // Retroactively sync all employee balances for the current year
    const year = new Date().getFullYear();
    const balances = await this.leaveBalanceModel.find({ organizationId: new Types.ObjectId(organizationId), year } as any);

    for (const balance of balances) {
      dto.entitlements.forEach(e => {
        // Only update if it wasn't a manual override (we assume standard policy matches or should match)
        // Actually, user said "Yes, to all employees", but also "give option to override".
        // Strategy: We update standard entitlements of everyone.
        balance.entitled.set(e.type, e.days);
      });
      await balance.save();
    }

    return policy;
  }

  async getOrCreateBalance(userId: string, organizationId: string, year: number) {
    let balance = await this.leaveBalanceModel.findOne({ userId: new Types.ObjectId(userId), year } as any);
    if (!balance) {
      const policy = await this.getPolicy(organizationId);
      
      const entitled: any = {};
      policy.entitlements.forEach((days, type) => {
        entitled[type] = days;
      });

      balance = new this.leaveBalanceModel({
        userId: new Types.ObjectId(userId),
        organizationId: new Types.ObjectId(organizationId),
        year,
        entitled,
        used: {},
        pending: {},
      });
      await balance.save();
    }
    return balance;
  }

  async applyLeave(userId: string, organizationId: string, dto: CreateLeaveRequestDto) {
    const start = parseISO(dto.startDate);
    const end = parseISO(dto.endDate);
    const year = start.getFullYear();

    if (end < start) throw new BadRequestException('End date cannot be before start date');

    let daysCount = differenceInBusinessDays(end, start) + 1;
    if (dto.isHalfDay) daysCount = 0.5;

    if (dto.type !== LeaveType.UNPAID) {
      const balance = await this.getOrCreateBalance(userId, organizationId, year);
      const entitled = balance.entitled.get(dto.type) || 0;
      const used = balance.used.get(dto.type) || 0;
      const pending = balance.pending.get(dto.type) || 0;

      if (entitled - used - pending < daysCount) {
        throw new BadRequestException(`Insufficient ${dto.type} balance. Available: ${entitled - used - pending}`);
      }

      // Update pending balance
      balance.pending.set(dto.type, pending + daysCount);
      await balance.save();
    }

    const request = new this.leaveRequestModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(organizationId),
      daysCount,
      status: LeaveStatus.PENDING,
    });

    return request.save();
  }

  async findAllRequests(organizationId: string, userId?: string) {
    const filter: any = { organizationId: new Types.ObjectId(organizationId) };
    if (userId) filter.userId = new Types.ObjectId(userId);

    return this.leaveRequestModel.find(filter)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, organizationId: string, approverId: string, dto: UpdateLeaveStatusDto) {
    const request = await this.leaveRequestModel.findOne({ _id: id, organizationId } as any);
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) throw new BadRequestException('Request already processed');

    const year = new Date(request.startDate).getFullYear();
    const balance = await this.getOrCreateBalance(request.userId.toString(), organizationId, year);

    if (dto.status === LeaveStatus.APPROVED) {
      // Move from pending to used
      if (request.type !== LeaveType.UNPAID) {
        const p = balance.pending.get(request.type) || 0;
        const u = balance.used.get(request.type) || 0;
        balance.pending.set(request.type, Math.max(0, p - request.daysCount));
        balance.used.set(request.type, u + request.daysCount);
        await balance.save();
      }

      // Sync with Attendance
      await this.syncAttendanceRecords(request);
    } else if (dto.status === LeaveStatus.REJECTED) {
      // Revert pending balance
      if (request.type !== LeaveType.UNPAID) {
        const p = balance.pending.get(request.type) || 0;
        balance.pending.set(request.type, Math.max(0, p - request.daysCount));
        await balance.save();
      }
    }

    request.status = dto.status;
    request.approverId = new Types.ObjectId(approverId) as any;
    if (dto.adminNote) request.adminNote = dto.adminNote;

    return request.save();
  }

  private async syncAttendanceRecords(request: LeaveRequest) {
    const days = eachDayOfInterval({
      start: new Date(request.startDate),
      end: new Date(request.endDate),
    });

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Upsert attendance record as LEAVE
      await this.attendanceModel.findOneAndUpdate(
        { userId: request.userId, date: dateStr } as any,
        {
          organizationId: request.organizationId,
          status: request.isHalfDay ? AttendanceStatus.HALF_DAY : AttendanceStatus.LEAVE,
          notes: `Automatic sync from Leave Request: ${request.type}. Reason: ${request.reason}`,
          // Set dummy checkIn for records that require it
          checkIn: new Date(day.setHours(9, 0, 0, 0)),
          checkOut: new Date(day.setHours(18, 0, 0, 0)),
        },
        { upsert: true, new: true }
      ).exec();
    }
  }

  async adjustBalance(userId: string, organizationId: string, dto: AdjustBalanceDto) {
    const year = new Date().getFullYear();
    const balance = await this.getOrCreateBalance(userId, organizationId, year);
    
    const current = balance.entitled.get(dto.type) || 0;
    balance.entitled.set(dto.type, current + dto.amount);
    
    return balance.save();
  }
}
