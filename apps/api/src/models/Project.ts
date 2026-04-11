import mongoose, { Schema, Document } from 'mongoose';
import { ProjectStatus } from '@epms/shared';

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: ProjectStatus;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD'], default: 'ACTIVE' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Compound index for tenant isolation
ProjectSchema.index({ organizationId: 1, _id: 1 });
ProjectSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
