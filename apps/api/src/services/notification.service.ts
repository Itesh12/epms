import nodemailer from 'nodemailer';
import Notification from '../models/Notification';
import { getIO } from '../lib/socket';
import { NotificationType } from '@epms/shared';
import mongoose from 'mongoose';

// Mock Email Transport
const transport = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "ethereal.user@ethereal.email",
    pass: "ethereal.pass"
  }
});

export const sendNotification = async (params: {
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type?: NotificationType;
  targetUrl?: string;
}) => {
  try {
    const { userId, organizationId, title, message, type = 'INFO', targetUrl } = params;

    // 1. Save to Database
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      title,
      message,
      type,
      targetUrl,
      isRead: false
    });
    await notification.save();

    // 2. Emit via Socket.io
    const io = getIO();
    io.to(`user:${userId}`).emit('notification-received', notification);

    // 3. Mock Email (Log to console for now as redirected)
    console.log(`📧 [MOCK EMAIL] To: user_${userId}, Subject: ${title}, Body: ${message}`);
    
    // Optional actual send to Ethereal
    /*
    await transport.sendMail({
      from: '"EPMS System" <noreply@epms.com>',
      to: "recipient@example.com",
      subject: title,
      text: message,
      html: `<b>${message}</b>`
    });
    */

    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};
