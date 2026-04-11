import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceStatus, ActivityType } from '@epms/shared';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  activities: Array<{
    startTime: Date;
    endTime?: Date;
    type: 'WORK' | 'BREAK';
    note?: string;
  }>;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_BREAK' | 'NOT_STARTED';
  checkInTime?: Date;
  checkOutTime?: Date;
}

const AttendanceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  activities: [{
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    type: { type: String, enum: ['WORK', 'BREAK'], required: true },
    note: { type: String }
  }],
  totalWorkMinutes: { type: Number, default: 0 },
  totalBreakMinutes: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PRESENT', 'ABSENT', 'LATE', 'ON_BREAK', 'NOT_STARTED'], 
    default: 'NOT_STARTED' 
  },
  checkInTime: { type: Date },
  checkOutTime: { type: Date }
}, {
  timestamps: true
});

// Compound index for fast lookup and to prevent duplicate daily records for a user
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ organizationId: 1, date: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
