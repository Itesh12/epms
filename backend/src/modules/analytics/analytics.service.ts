import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { Project, ProjectStatus } from '../projects/schemas/project.schema';
import { Task, TaskStatus } from '../tasks/schemas/task.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async getDeepMetrics(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    
    // 30 days boundary
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [roleAggregation, statusAggregation, velocityAggregation] = await Promise.all([
      // 1. Role Distribution
      this.userModel.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),

      // 2. Project Status Completion Ratio
      this.projectModel.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 3. 30-Day Velocity Map
      this.projectModel.aggregate([
        { 
          $match: { 
            organizationId: orgId, 
            createdAt: { $gte: thirtyDaysAgo } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            created: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Format Roles Data for Recharts
    const roleDistribution = roleAggregation.map(r => ({
      name: r._id,
      value: r.count
    }));

    // Format Status Data for Recharts
    const statusRatio = statusAggregation.map(s => ({
      name: s._id.replace('_', ' '),
      value: s.count
    }));

    // Fill missing days in 30-day velocity chart
    const monthlyVelocity = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = velocityAggregation.find(v => v._id === dateStr);
      monthlyVelocity.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        projects: match ? match.created : 0,
      });
    }

    return {
      roleDistribution,
      statusRatio,
      monthlyVelocity
    };
  }

  async getEmployeePerformance(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);

    const performanceStats = await this.taskModel.aggregate([
      { $match: { organizationId: orgId, status: TaskStatus.DONE } },
      {
        $group: {
          _id: '$assigneeId',
          totalCompleted: { $sum: 1 },
          avgEfficiency: {
            $avg: {
              $cond: [
                { $gt: ['$actualHours', 0] },
                { $min: [1.25, { $divide: ['$estimatedHours', '$actualHours'] }] },
                1.0 // Default efficiency if actualHours not logged
              ]
            }
          },
          onTimeCount: {
            $sum: {
              $cond: [
                { $lte: ['$completedAt', '$dueDate'] },
                1,
                0
              ]
            }
          }
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
          email: '$user.email',
          totalCompleted: 1,
          efficiency: { $multiply: ['$avgEfficiency', 100] }, // As percentage
          punctuality: { 
            $multiply: [
              { $divide: ['$onTimeCount', '$totalCompleted'] },
              100
            ] 
          }
        }
      },
      { $sort: { efficiency: -1 } }
    ]);

    return performanceStats;
  }
}
