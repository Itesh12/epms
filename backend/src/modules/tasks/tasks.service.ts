import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto, orgId: string): Promise<Task> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      organizationId: new Types.ObjectId(orgId),
      projectId: new Types.ObjectId(createTaskDto.projectId),
      assigneeId: new Types.ObjectId(createTaskDto.assigneeId),
      parentId: createTaskDto.parentId ? new Types.ObjectId(createTaskDto.parentId) : null,
    });
    return newTask.save();
  }

  async findAllByProject(projectId: string, orgId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        projectId: new Types.ObjectId(projectId),
        organizationId: new Types.ObjectId(orgId),
      } as any)
      .sort({ createdAt: -1 })
      .populate('assigneeId', 'email role')
      .exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, orgId: string): Promise<Task> {
    const filter = { 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(orgId) 
    } as any;

    // If status is changed to DONE and completedAt isn't set, set it automatically
    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.status === TaskStatus.DONE && !updateTaskDto.completedAt) {
      updateData.completedAt = new Date();
    }

    if (updateTaskDto.assigneeId) {
      updateData.assigneeId = new Types.ObjectId(updateTaskDto.assigneeId);
    }

    const updatedTask = await this.taskModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true }
    ).populate('assigneeId', 'email role').exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return updatedTask as any;
  }

  async remove(id: string, orgId: string): Promise<void> {
    const filter = { 
      _id: new Types.ObjectId(id), 
      organizationId: new Types.ObjectId(orgId) 
    } as any;
    
    // Check if task has subtasks and disconnect them or handle them?
    // For now, simple delete. Recursion can be handled by client if needed or cascaded here.
    const result = await this.taskModel.deleteOne(filter).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async findByAssignee(assigneeId: string, orgId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        assigneeId: new Types.ObjectId(assigneeId),
        organizationId: new Types.ObjectId(orgId),
      } as any)
      .sort({ dueDate: 1 })
      .populate('projectId', 'title')
      .exec();
  }
}
