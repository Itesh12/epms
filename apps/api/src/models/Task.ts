import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '@epms/shared';

export interface ITaskComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: Date;
  estimatedHours?: number;
  position: number;
  timeSpent: number; // in seconds
  comments: ITaskComment[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const TaskSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  deadline: { type: Date },
  estimatedHours: { type: Number },
  position: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  comments: [TaskCommentSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

TaskSchema.index({ organizationId: 1, status: 1, priority: 1 });
TaskSchema.index({ assigneeId: 1, status: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
