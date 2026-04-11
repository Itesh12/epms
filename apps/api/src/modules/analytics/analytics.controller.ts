import { Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../../models/Attendance';
import Task from '../../models/Task';
import Project from '../../models/Project';
import Organization from '../../models/Organization';
import { differenceInDays, isBefore, parse } from 'date-fns';

export const getAttendanceAnalytics = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const org = await Organization.findById(organizationId);
    const startTime = org?.workingHours?.start || '09:00';

    const stats = await Attendance.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: null,
          totalWorkMinutes: { $sum: '$totalWorkMinutes' },
          totalBreakMinutes: { $sum: '$totalBreakMinutes' },
          count: { $sum: 1 },
          lateCount: {
            $sum: {
              $cond: [
                { $gt: [{ $hour: '$checkInTime' }, parseInt(startTime.split(':')[0])] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const trends = await Attendance.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    const result = {
      totalPresent: stats[0]?.count || 0,
      avgWorkMinutes: stats[0]?.count ? Math.round(stats[0].totalWorkMinutes / stats[0].count) : 0,
      lateLoginCount: stats[0]?.lateCount || 0,
      breakMisuseCount: 0, // Placeholder for complex logic
      trends
    };

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductivityAnalytics = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);

    const taskStats = await Task.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgTime: { $avg: '$timeSpent' }
        }
      }
    ]);

    const distribution = await Task.aggregate([
      { $match: { organizationId, status: { $ne: 'DONE' } } },
      {
        $group: {
          _id: '$assigneeId',
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          taskCount: 1,
          _id: 0
        }
      }
    ]);

    const completed = taskStats.find(s => s._id === 'DONE')?.count || 0;
    const total = taskStats.reduce((acc, s) => acc + s.count, 0);

    res.status(200).json({
      overallScore: total > 0 ? Math.round((completed / total) * 100) : 0,
      tasksCompleted: completed,
      avgCompletionTime: Math.round((taskStats.find(s => s._id === 'DONE')?.avgTime || 0) / 3600),
      workloadDistribution: distribution
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectPerformance = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const projects = await Project.find({ organizationId });

    const performance = await Promise.all(projects.map(async (project) => {
      const tasks = await Task.find({ projectId: project._id });
      const completed = tasks.filter(t => t.status === 'DONE').length;
      const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

      // AI-lite Delay Prediction
      let predictedDelayDays = 0;
      const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.deadline && isBefore(new Date(t.deadline), new Date()));
      if (overdueTasks.length > 0) {
        predictedDelayDays = overdueTasks.length * 2; // Simple heuristic
      }

      return {
        projectId: project._id,
        projectName: project.name,
        progress,
        isOnTrack: predictedDelayDays === 0,
        predictedDelayDays,
        bottleneckStatus: 'IN_PROGRESS' as any
      };
    }));

    res.status(200).json(performance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInsights = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const insights: any[] = [];

    // 1. Imbalance Insight
    const tasksPerUser = await Task.aggregate([
      { $match: { organizationId, status: { $ne: 'DONE' } } },
      { $group: { _id: '$assigneeId', count: { $sum: 1 } } }
    ]);

    if (tasksPerUser.length > 0) {
      const maxTasks = Math.max(...tasksPerUser.map(u => u.count));
      const minTasks = Math.min(...tasksPerUser.map(u => u.count));
      if (maxTasks > minTasks + 5) {
        insights.push({
          type: 'IMBALANCE',
          severity: 'HIGH',
          message: 'Extreme workload imbalance detected. Some team members have significantly more tasks than others.'
        });
      }
    }

    // 2. Delay Insight
    const overDueCount = await Task.countDocuments({ 
      organizationId, 
      status: { $ne: 'DONE' },
      deadline: { $lt: new Date() }
    });

    if (overDueCount > 0) {
      insights.push({
        type: 'DELAY',
        severity: 'MEDIUM',
        message: `${overDueCount} tasks are currently overdue. Project timelines may be at risk.`
      });
    }

    res.status(200).json(insights);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
