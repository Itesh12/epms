import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalTargetType, ApprovalStatus } from '@epms/shared';

export interface IApprovalHistory {
  stepOrder: number;
  status: ApprovalStatus;
  reviewedBy: mongoose.Types.ObjectId;
  comment?: string;
  reviewedAt: Date;
}

export interface IApprovalRequest extends Document {
  organizationId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: ApprovalTargetType;
  flowId?: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  currentStepOrder: number;
  status: ApprovalStatus;
  history: IApprovalHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalHistorySchema = new Schema({
  stepOrder: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], required: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String },
  reviewedAt: { type: Date, default: Date.now }
}, { _id: false });

const ApprovalRequestSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  targetType: { type: String, enum: ['TIMESHEET', 'LEAVE', 'ATTENDANCE_CORRECTION'], required: true },
  flowId: { type: Schema.Types.ObjectId, ref: 'ApprovalFlow' },
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentStepOrder: { type: Number, default: 1 },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
  history: [ApprovalHistorySchema]
}, { timestamps: true });

export default mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);
