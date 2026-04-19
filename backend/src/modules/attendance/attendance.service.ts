import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceStatus } from './schemas/attendance.schema';
import { User } from '../users/schemas/user.schema';
import { format, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  async checkIn(userId: string, orgId: string): Promise<Attendance> {
    const today = this.getTodayString();
    
    const existing = await this.attendanceModel.findOne({ userId: userId as any, date: today });
    if (existing) {
      throw new BadRequestException('Already checked in for today');
    }

    const now = new Date();
    const latesThreshold = new Date();
    latesThreshold.setHours(10, 30, 0, 0);

    const status = now > latesThreshold ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    const attendance = new this.attendanceModel({
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(orgId),
      date: today,
      checkIn: now,
      status,
    });

    return attendance.save();
  }

  async checkOut(userId: string, orgId: string): Promise<Attendance> {
    const today = this.getTodayString();
    const attendance = await this.attendanceModel.findOne({ 
      userId: userId as any, 
      date: today,
      organizationId: orgId as any
    } as any);

    if (!attendance) {
      throw new BadRequestException('No check-in record found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out for today');
    }

    // End any active break first
    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (activeBreak) {
      activeBreak.endTime = new Date();
    }

    attendance.checkOut = new Date();
    attendance.totalWorkMinutes = this.calculateWorkMinutes(attendance);
    
    return attendance.save();
  }

  async startBreak(userId: string, orgId: string, reason?: string): Promise<Attendance> {
    const today = this.getTodayString();
    const attendance = await this.attendanceModel.findOne({ 
      userId: userId as any, 
      date: today,
      organizationId: orgId as any
    } as any);

    if (!attendance || attendance.checkOut) {
      throw new BadRequestException('Must be checked in and not checked out to start a break');
    }

    if (attendance.breaks.some(b => !b.endTime)) {
      throw new BadRequestException('Already on a break');
    }

    attendance.breaks.push({
      startTime: new Date(),
      reason,
    });

    return attendance.save();
  }

  async endBreak(userId: string, orgId: string): Promise<Attendance> {
    const today = this.getTodayString();
    const attendance = await this.attendanceModel.findOne({ 
      userId: userId as any, 
      date: today,
      organizationId: orgId as any
    } as any);

    if (!attendance) throw new NotFoundException('Record not found');

    const activeBreak = attendance.breaks.find(b => !b.endTime);
    if (!activeBreak) {
      throw new BadRequestException('No active break found');
    }

    activeBreak.endTime = new Date();
    return attendance.save();
  }

  async getTodayStatus(userId: string, orgId: string): Promise<Attendance | null> {
    return this.attendanceModel.findOne({ 
      userId: userId as any, 
      date: this.getTodayString(),
      organizationId: orgId as any
    });
  }

  async getMyHistory(userId: string, orgId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ 
      userId: userId as any,
      organizationId: orgId as any
    }).sort({ date: -1 }).limit(30);
  }

  async getUserHistory(userId: string, orgId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ 
      userId: userId as any,
      organizationId: orgId as any
    }).sort({ date: -1 });
  }

  async getAllHistory(orgId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ organizationId: orgId as any })
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1, createdAt: -1 });
  }

  async markAbsentForDate(date: string, orgId: string, userIds?: string[]): Promise<{ marked: number }> {
    let targetUsers;
    
    if (userIds && userIds.length > 0) {
      // Validate requested users are in the org
      targetUsers = await this.userModel.find({ 
        _id: { $in: userIds },
        organizationId: orgId as any,
        isActive: true 
      }).lean();
    } else {
      // Fallback: Get ALL active users in the org who are missing records
      const allUsers = await this.userModel.find({ organizationId: orgId as any, isActive: true }).lean();
      targetUsers = allUsers;
    }

    // Find who already has a record on that date
    const existing = await this.attendanceModel.find({ 
      organizationId: orgId as any, 
      date 
    } as any).lean();
    const existingUserIds = new Set(existing.map((r: any) => r.userId.toString()));

    // Filter out users who already have records
    const absentUsers = targetUsers.filter((u: any) => !existingUserIds.has(u._id.toString()));

    if (absentUsers.length === 0) return { marked: 0 };

    const absentRecords = absentUsers.map((u: any) => ({
      userId: u._id,
      organizationId: orgId as any,
      date,
      status: AttendanceStatus.ABSENT,
      totalWorkMinutes: 0,
      breaks: [],
    }));

    await this.attendanceModel.insertMany(absentRecords, { ordered: false }).catch(() => {});
    return { marked: absentUsers.length };
  }

  async getLeaderboard(orgId: string): Promise<any[]> {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    
    const records = await this.attendanceModel.find({
      organizationId: orgId as any,
      date: { $gte: format(start, 'yyyy-MM-dd'), $lte: format(end, 'yyyy-MM-dd') },
      status: { $in: ['PRESENT', 'LATE', 'HALF_DAY'] }
    }).populate('userId', 'firstName lastName').lean();

    const userStats = new Map<string, { name: string; minutes: number }>();
    records.forEach((r: any) => {
      const uid = r.userId?._id.toString();
      if (!uid) return;
      const current = userStats.get(uid) || { name: `${r.userId.firstName} ${r.userId.lastName}`, minutes: 0 };
      current.minutes += (r.totalWorkMinutes || 0);
      userStats.set(uid, current);
    });

    return Array.from(userStats.values())
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3);
  }

  async getMissingEmployees(date: string, orgId: string): Promise<User[]> {
    const allUsers = await this.userModel.find({ organizationId: orgId as any, isActive: true }).lean();
    const existing = await this.attendanceModel.find({ organizationId: orgId as any, date } as any).lean();
    const existingUserIds = new Set(existing.map((r: any) => r.userId.toString()));
    
    return allUsers.filter((u: any) => !existingUserIds.has(u._id.toString())) as any;
  }

  async getLiveActivity(orgId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({
      organizationId: orgId as any,
      date: this.getTodayString(),
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    }).populate('userId', 'firstName lastName email').lean();
  }

  async adminCreate(data: any, orgId: string): Promise<Attendance> {
    const { userId, date, checkIn, checkOut, status } = data;
    
    // Check for existing
    const existing = await this.attendanceModel.findOne({ 
      userId: userId as any, 
      date,
      organizationId: orgId as any
    } as any);

    if (existing) {
      throw new BadRequestException('A record already exists for this employee on this date');
    }

    const attendance = new this.attendanceModel({
      userId: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(orgId),
      date,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      status,
    });

    if (attendance.checkIn && attendance.checkOut) {
      attendance.totalWorkMinutes = this.calculateWorkMinutes(attendance);
    }

    return attendance.save();
  }

  async adminUpdate(id: string, updateData: any, orgId: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findOne({
      _id: id as any,
      organizationId: orgId as any
    });

    if (!attendance) throw new NotFoundException('Attendance record not found');

    if (updateData.checkIn) updateData.checkIn = new Date(updateData.checkIn);
    if (updateData.checkOut) updateData.checkOut = new Date(updateData.checkOut);

    Object.assign(attendance, updateData);
    
    // Recalculate work minutes if timings changed
    if (updateData.checkIn || updateData.checkOut || updateData.breaks) {
      attendance.totalWorkMinutes = this.calculateWorkMinutes(attendance);
    }

    return attendance.save();
  }

  async delete(id: string, orgId: string): Promise<void> {
    const result = await this.attendanceModel.deleteOne({
      _id: id as any,
      organizationId: orgId as any
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Attendance record not found');
    }
  }

  async exportAttendance(orgId: string, userId?: string, startDate?: string, endDate?: string): Promise<string> {
    const query: any = { organizationId: orgId as any };
    if (userId) query.userId = userId as any;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const records = await this.attendanceModel.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1, checkIn: -1 })
      .lean();

    const headers = ['Date', 'Employee', 'Email', 'Status', 'Check In', 'Check Out', 'Work Minutes', 'Notes'];
    const rows = records.map((r: any) => [
      r.date,
      `${r.userId?.firstName} ${r.userId?.lastName}`,
      r.userId?.email,
      r.status,
      r.checkIn ? format(new Date(r.checkIn), 'HH:mm:ss') : '',
      r.checkOut ? format(new Date(r.checkOut), 'HH:mm:ss') : '',
      r.totalWorkMinutes || 0,
      (r.notes || '').replace(/,/g, ';')
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private calculateWorkMinutes(attendance: Attendance): number {
    if (!attendance.checkIn || !attendance.checkOut) return 0;
    
    const totalDurationMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
    
    let breakDurationMs = 0;
    attendance.breaks.forEach(b => {
      if (b.startTime && b.endTime) {
        breakDurationMs += b.endTime.getTime() - b.startTime.getTime();
      }
    });

    const workDurationMs = totalDurationMs - breakDurationMs;
    return Math.max(0, Math.floor(workDurationMs / (1000 * 60)));
  }
}
