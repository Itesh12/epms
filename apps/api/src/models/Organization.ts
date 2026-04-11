import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  adminId: mongoose.Types.ObjectId;
  workingHours?: {
    start: string;
    end: string;
  };
  createdAt: Date;
}

const OrganizationSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
  },
}, { timestamps: true });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
