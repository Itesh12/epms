import mongoose, { Schema, Document } from 'mongoose';
import { CorrectionStatus } from '@epms/shared';

export interface IAttendanceCorrection extends Document {
  attendanceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  requestedAt: Date;
  reason: string;
  correctionType: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK';
  originalTime?: Date;
  requestedTime: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  adminComment?: string;
  approvalRequestId?: mongoose.Types.ObjectId;
}

const AttendanceCorrectionSchema: Schema = new Schema({
  attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  requestedAt: { type: Date, default: Date.now },
  reason: { type: String, required: true },
  correctionType: { 
    type: String, 
    enum: ['CHECK_IN', 'CHECK_OUT', 'BREAK'], 
    required: true 
  },
  originalTime: { type: Date },
  requestedTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  adminComment: { type: String },
  approvalRequestId: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' }
}, {
  timestamps: true
});

AttendanceCorrectionSchema.index({ organizationId: 1, status: 1 });
AttendanceCorrectionSchema.index({ userId: 1 });

export default mongoose.model<IAttendanceCorrection>('AttendanceCorrection', AttendanceCorrectionSchema);
