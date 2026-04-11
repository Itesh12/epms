import mongoose, { Schema, Document } from 'mongoose';

export interface ITimesheetEntry {
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  date: Date;
  hoursLogged: number;
  description?: string;
}

export interface ITimesheet extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startDate: Date; // Monday
  endDate: Date; // Sunday
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  entries: ITimesheetEntry[];
  totalHours: number;
  approvalRequestId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetEntrySchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  date: { type: Date, required: true },
  hoursLogged: { type: Number, required: true },
  description: { type: String }
}, { _id: false });

const TimesheetSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'], default: 'DRAFT' },
  entries: [TimesheetEntrySchema],
  totalHours: { type: Number, default: 0 },
  approvalRequestId: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' }
}, { timestamps: true });

TimesheetSchema.index({ userId: 1, startDate: 1 });

export default mongoose.model<ITimesheet>('Timesheet', TimesheetSchema);
