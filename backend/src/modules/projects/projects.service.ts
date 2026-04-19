import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string, orgId: string): Promise<Project> {
    const newProject = new this.projectModel({
      ...createProjectDto,
      createdBy: new Types.ObjectId(userId),
      organizationId: new Types.ObjectId(orgId),
      // Automatically add creator to members
      members: Array.from(new Set([...(createProjectDto.members || []), userId])).map(id => new Types.ObjectId(id)),
    });
    return newProject.save();
  }

  async findAll(orgId: string, user: any): Promise<any[]> {
    const orgObjectId = new Types.ObjectId(orgId);
    
    // Admins see everything, others only see assigned projects
    const filter: any = { organizationId: orgObjectId };
    if (user.role !== UserRole.ADMIN) {
      filter.members = new Types.ObjectId(user.userId);
    }
    
    const projectsWithProgress = await this.projectModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'projectId',
          as: 'tasks'
        }
      },
      {
        $addFields: {
          totalTasks: { $size: '$tasks' },
          completedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $eq: ['$$task.status', 'DONE'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          progress: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              0
            ]
          }
        }
      },
      { $project: { tasks: 0 } }
    ]);

    return projectsWithProgress;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: any): Promise<Project> {
    const orgId = user.orgId;
    const project = await this.projectModel.findOne({ 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(orgId) 
    } as any).exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Permission check: Admin or Creator/Lead
    const isOwner = project.createdBy.toString() === user.userId;
    const isAdmin = user.role === UserRole.ADMIN;
    
    if (!isOwner && !isAdmin) {
      throw new NotFoundException('You do not have permission to edit this project');
    }

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.members) {
      updateData.members = updateProjectDto.members.map(mid => new Types.ObjectId(mid));
    }

    const updatedProject = await this.projectModel.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true },
    ).exec();
    
    return updatedProject as any as Project;
  }

  async remove(id: string, user: any): Promise<void> {
    const project = await this.projectModel.findOne({ 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(user.orgId) 
    } as any).exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN && project.createdBy.toString() !== user.userId) {
      throw new NotFoundException('Only Admins or the Project Creator can delete this project');
    }

    await this.projectModel.deleteOne({ _id: id }).exec();
  }

  async findOne(id: string, user: any): Promise<any> {
    const project = await this.projectModel.findOne({ 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(user.orgId) 
    } as any).populate('members', 'email role').exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Permission check: Admin see all, others only assigned
    if (user.role !== UserRole.ADMIN && !project.members.some((m: any) => m._id.toString() === user.userId)) {
      throw new NotFoundException('You do not have access to this project');
    }

    return project;
  }
}
