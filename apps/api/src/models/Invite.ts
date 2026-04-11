import mongoose, { Schema, Document } from 'mongoose';

export interface IInvite extends Document {
  code: string;
  organizationId: mongoose.Types.ObjectId;
  role: 'MANAGER' | 'EMPLOYEE';
  email?: string;
  isUsed: boolean;
  expiresAt: Date;
}

const InviteSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  role: { type: String, enum: ['MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' },
  email: { type: String },
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<IInvite>('Invite', InviteSchema);
