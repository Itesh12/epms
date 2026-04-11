import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../../models/Notification';

export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId },
      { isRead: true }
    );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
