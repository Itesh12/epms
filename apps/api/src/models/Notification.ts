import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType } from '@epms/shared';

export interface INotification extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  targetUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TASK', 'TIME', 'APPROVAL'], 
    default: 'INFO' 
  },
  isRead: { type: Boolean, default: false },
  targetUrl: { type: String }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
