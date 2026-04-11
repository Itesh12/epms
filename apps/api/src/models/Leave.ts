import mongoose, { Schema, Document } from 'mongoose';
import { LeaveType } from '@epms/shared';

export interface ILeave extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalRequestId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  leaveType: { 
    type: String, 
    enum: ['SICK', 'VACATION', 'PERSONAL', 'BEREAVEMENT', 'OTHER'], 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvalRequestId: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' }
}, { timestamps: true });

export default mongoose.model<ILeave>('Leave', LeaveSchema);
