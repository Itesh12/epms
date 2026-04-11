import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
