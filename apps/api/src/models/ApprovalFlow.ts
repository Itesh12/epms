import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalTargetType } from '@epms/shared';

export interface IApprovalFlowStep {
  stepOrder: number;
  requiredRole: 'MANAGER' | 'HR' | 'ADMIN' | 'DIRECT_MANAGER';
}

export interface IApprovalFlow extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  targetType: ApprovalTargetType;
  steps: IApprovalFlowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalFlowStepSchema = new Schema({
  stepOrder: { type: Number, required: true },
  requiredRole: { type: String, enum: ['MANAGER', 'HR', 'ADMIN', 'DIRECT_MANAGER'], required: true },
}, { _id: false });

const ApprovalFlowSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['TIMESHEET', 'LEAVE', 'ATTENDANCE_CORRECTION'], 
    required: true,
    index: true
  },
  steps: [ApprovalFlowStepSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ApprovalFlowSchema.index({ organizationId: 1, targetType: 1 });

export default mongoose.model<IApprovalFlow>('ApprovalFlow', ApprovalFlowSchema);
