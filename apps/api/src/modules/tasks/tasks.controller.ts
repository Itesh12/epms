import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../../models/Task';
import { getIO } from '../../lib/socket';
import { sendNotification } from '../../services/notification.service';

export const createTask = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { projectId, title, description, assigneeId, priority, deadline, status } = req.body;

    const task = new Task({
      organizationId,
      projectId: new mongoose.Types.ObjectId(projectId),
      title,
      description,
      assigneeId: assigneeId ? new mongoose.Types.ObjectId(assigneeId) : undefined,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      deadline,
      createdBy: userId,
    });

    await task.save();
    
    // Trigger notification if assignee exists
    if (task.assigneeId) {
      await sendNotification({
        userId: task.assigneeId.toString(),
        organizationId: organizationId.toString(),
        title: 'New Task Assigned',
        message: `You have been assigned: ${task.title}`,
        type: 'TASK',
        targetUrl: `/projects/${projectId}`
      });
    }

    // Emit socket event
    getIO().to(organizationId.toString()).emit(`project:${projectId}:task-created`, task);

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByProject = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { projectId } = req.params;

    const tasks = await Task.find({ 
      organizationId, 
      projectId: new mongoose.Types.ObjectId(projectId) 
    }).populate('assigneeId', 'name email avatar').sort({ position: 1, createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), organizationId },
      { $set: req.body },
      { new: true }
    ).populate('assigneeId', 'name email avatar');
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Trigger notification on reassignment/update if assignee exists
    if (req.body.assigneeId) {
      await sendNotification({
        userId: req.body.assigneeId,
        organizationId: organizationId.toString(),
        title: 'Task Assignment Update',
        message: `You have a task update: ${task.title}`,
        type: 'TASK',
        targetUrl: `/projects/${task.projectId}`
      });
    }

    // Emit socket event
    getIO().to(organizationId.toString()).emit(`project:${task.projectId}:task-updated`, task);

    // Notify creator if task is completed
    if (req.body.status === 'DONE' && task.createdBy.toString() !== req.user.userId) {
      await sendNotification({
        userId: task.createdBy.toString(),
        organizationId: organizationId.toString(),
        title: 'Task Completed',
        message: `Task "${task.title}" has been marked as DONE.`,
        type: 'SUCCESS',
        targetUrl: `/projects/${task.projectId}`
      });
    }

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { id } = req.params;
    const { text } = req.body;

    const task = await Task.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newComment = {
      userId,
      text,
    };

    task.comments.push(newComment as any);
    await task.save();
    
    // We can populate user before emitting, but for simplicity let's emit ID and let frontend handle or refetch
    getIO().to(organizationId.toString()).emit(`project:${task.projectId}:task-updated`, task);

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addTime = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { id } = req.params;
    const { timeSpent } = req.body; // in seconds to add

    const task = await Task.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.timeSpent += timeSpent;
    await task.save();
    
    getIO().to(organizationId.toString()).emit(`project:${task.projectId}:task-updated`, task);

    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTasks = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const assigneeId = new mongoose.Types.ObjectId(req.user.userId);

    const tasks = await Task.find({ organizationId, assigneeId }).populate('projectId', 'name').sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
