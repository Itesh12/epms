import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceStatus } from './schemas/attendance.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
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

  async getAllHistory(orgId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ organizationId: orgId as any })
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1, createdAt: -1 });
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
