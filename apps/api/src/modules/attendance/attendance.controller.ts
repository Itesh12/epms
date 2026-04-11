import { Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../../models/Attendance';
import { format } from 'date-fns';
import { getIO } from '../../lib/socket';

export const checkIn = async (req: any, res: Response) => {
  try {
    // Check-in initiated
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const today = format(new Date(), 'yyyy-MM-dd');

    let attendance = await Attendance.findOne({ userId, date: today });

    if (attendance) {
      const activeActivity = attendance.activities.find(a => !a.endTime);
      if (activeActivity) {
        return res.status(400).json({ message: 'You already have an active session running.' });
      }
    }

    const newActivity = {
      startTime: new Date(),
      type: 'WORK' as const
    };

    if (!attendance) {
      attendance = new Attendance({
        userId,
        organizationId,
        date: today,
        activities: [newActivity],
        status: 'PRESENT',
        checkInTime: newActivity.startTime
      });
    } else {
      attendance.activities.push(newActivity);
      attendance.status = 'PRESENT';
    }

    await attendance.save();
    
    // Emit real-time update
    getIO().to(organizationId.toString()).emit('attendance:update', attendance);
    
    res.status(200).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBreak = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const today = format(new Date(), 'yyyy-MM-dd');

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance) {
      return res.status(404).json({ message: 'No active attendance record found for today.' });
    }

    const activeActivity = attendance.activities.find(a => !a.endTime);
    if (!activeActivity) {
      return res.status(400).json({ message: 'No active session to toggle break from.' });
    }

    // Rules Engine: Minimum 1 minute activity duration
    const durationInSeconds = (new Date().getTime() - new Date(activeActivity.startTime).getTime()) / 1000;
    if (durationInSeconds < 60) {
      return res.status(400).json({ 
        message: `You must be in ${activeActivity.type.toLowerCase()} mode for at least 1 minute before toggling. (${Math.floor(durationInSeconds)}s elapsed)` 
      });
    }

    // Close current session
    const now = new Date();
    activeActivity.endTime = now;

    // Toggle logic
    const newType = activeActivity.type === 'WORK' ? 'BREAK' : 'WORK';
    attendance.status = newType === 'BREAK' ? 'ON_BREAK' : 'PRESENT';

    attendance.activities.push({
      startTime: now,
      type: newType as any
    });

    await attendance.save();
    
    // Emit real-time update
    getIO().to(attendance.organizationId.toString()).emit('attendance:update', attendance);

    res.status(200).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const today = format(new Date(), 'yyyy-MM-dd');

    const attendance = await Attendance.findOne({ userId, date: today });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'You have already checked out for today.' });
    }

    const activeActivity = attendance.activities.find(a => !a.endTime);
    if (activeActivity) {
      // Rules Engine: Minimum 1 minute activity duration
      const durationInSeconds = (new Date().getTime() - new Date(activeActivity.startTime).getTime()) / 1000;
      if (durationInSeconds < 60) {
        return res.status(400).json({ 
          message: `You must wait at least 1 minute after starting an activity before checking out. (${Math.floor(durationInSeconds)}s elapsed)` 
        });
      }
      activeActivity.endTime = new Date();
    }

    attendance.checkOutTime = new Date();
    
    // Calculate totals
    let workMinutes = 0;
    let breakMinutes = 0;

    attendance.activities.forEach(activity => {
      if (activity.startTime && activity.endTime) {
        const duration = (activity.endTime.getTime() - activity.startTime.getTime()) / 1000 / 60;
        if (activity.type === 'WORK') workMinutes += duration;
        else breakMinutes += duration;
      }
    });

    // Use Math.floor and guarantee at least 1 minute is credited
    // if the employee actually did work (a session existed)
    attendance.totalWorkMinutes = workMinutes > 0 ? Math.max(1, Math.floor(workMinutes)) : 0;
    attendance.totalBreakMinutes = breakMinutes > 0 ? Math.max(0, Math.floor(breakMinutes)) : 0;
    // Setting status to NOT_STARTED or adding a COMPLETED status would be better, 
    // but we'll use a logic where checkOutTime presence means finished.
    // For now, let's keep it simple and the frontend should check checkOutTime.
    attendance.status = 'PRESENT'; 

    await attendance.save();
    
    // Emit real-time update
    getIO().to(attendance.organizationId.toString()).emit('attendance:update', attendance);

    res.status(200).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceStatus = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const today = format(new Date(), 'yyyy-MM-dd');
    const attendance = await Attendance.findOne({ userId, date: today });
    res.status(200).json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { startDate, endDate } = req.query;

    const reports = await Attendance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkMinutes: { $sum: '$totalWorkMinutes' },
          totalBreakMinutes: { $sum: '$totalBreakMinutes' },
          averageWorkHours: { $avg: { $divide: ['$totalWorkMinutes', 60] } },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json(reports[0] || { totalWorkMinutes: 0, totalBreakMinutes: 0, averageWorkHours: 0, count: 0 });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeatmapData = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { year } = req.query;
    
    // Simplistic yearly fetch for heatmap
    const data = await Attendance.find({
      userId,
      date: { $regex: `^${year}` }
    }, 'date totalWorkMinutes status');

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const today = new Date();
    
    // Weekly Work Hours
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyData = await Attendance.aggregate([
      {
        $match: {
          userId,
          date: { $gte: format(startOfWeek, 'yyyy-MM-dd') }
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$totalWorkMinutes' }
        }
      }
    ]);

    // Monthly Attendance %
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysSinceStartOfMonth = today.getDate();
    const attendanceCount = await Attendance.countDocuments({
      userId,
      date: { $gte: format(startOfMonth, 'yyyy-MM-dd') }
    });
    
    // Simple %: (days present / days passed in month) * 100
    const attendancePercentage = Math.round((attendanceCount / (daysSinceStartOfMonth || 1)) * 100);

    // Efficiency & Performance (Based on current month)
    const monthlyStats = await Attendance.aggregate([
      {
        $match: {
          userId,
          date: { $gte: format(startOfMonth, 'yyyy-MM-dd') }
        }
      },
      {
        $group: {
          _id: null,
          totalWork: { $sum: '$totalWorkMinutes' },
          totalBreak: { $sum: '$totalBreakMinutes' }
        }
      }
    ]);

    const stats = monthlyStats[0] || { totalWork: 0, totalBreak: 0 };
    const efficiency = stats.totalWork > 0 
      ? Math.round((stats.totalWork / (stats.totalWork + stats.totalBreak)) * 100) 
      : 0;

    res.status(200).json({
      workHours: `${((weeklyData[0]?.totalMinutes || 0) / 60).toFixed(1)}h`,
      attendance: `${attendancePercentage}%`,
      efficiency: `${efficiency}%`,
      perfScore: (efficiency / 20).toFixed(1), // Scale to 5.0
      tasksDone: 0 // Placeholder until Task module is built
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
