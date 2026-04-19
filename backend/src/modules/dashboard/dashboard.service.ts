import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { Project, ProjectStatus } from '../projects/schemas/project.schema';
import { Task, TaskStatus } from '../tasks/schemas/task.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async getStats(organizationId: string, userPayload: any) {
    const orgId = new Types.ObjectId(organizationId);
    const userId = new Types.ObjectId(userPayload.userId);
    const isAdmin = userPayload.role === UserRole.ADMIN;
    
    // Last 7 days boundary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Queries scoped by role
    const [totalEmployees, projectStats, velocityStats] = await Promise.all([
      // Only Admin sees total employees
      isAdmin ? this.userModel.countDocuments({ organizationId: orgId } as any) : Promise.resolve(1),
      
      // Project Distribution
      this.projectModel.aggregate([
        { 
          $match: { 
            organizationId: orgId,
            ...(isAdmin ? {} : { members: userId })
          } 
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // 7-day Velocity
      isAdmin ? 
        this.projectModel.aggregate([
          { $match: { organizationId: orgId, createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, created: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]) :
        this.taskModel.aggregate([
          { $match: { assigneeId: userId, organizationId: orgId, status: TaskStatus.DONE, updatedAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, created: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
    ]);

    const stats: Record<string, number> = {
      [ProjectStatus.ACTIVE]: 0,
      [ProjectStatus.COMPLETED]: 0,
    };
    
    projectStats.forEach((stat) => {
      if (stats[stat._id] !== undefined) stats[stat._id] = stat.count;
    });

    const totalProjects = Object.values(stats).reduce((a, b) => a + b, 0);

    const performanceVelocity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = velocityStats.find(v => v._id === dateStr);
      performanceVelocity.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: match ? match.created : 0,
        tasks: match ? match.created : 0,
      });
    }

    return {
      totalEmployees: isAdmin ? totalEmployees : 0, // Employees don't see team size here
      totalProjects,
      projectDistribution: stats,
      performanceVelocity,
      recentActivity: [], 
    };
  }
}
