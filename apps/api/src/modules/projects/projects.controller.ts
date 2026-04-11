import { Response } from 'express';
import mongoose from 'mongoose';
import Project from '../../models/Project';

export const createProject = async (req: any, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { name, description, members } = req.body;

    const project = new Project({
      organizationId,
      name,
      description,
      members: members ? members.map((m: string) => new mongoose.Types.ObjectId(m)) : [],
      createdBy: userId,
      status: 'ACTIVE'
    });

    await project.save();
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    
    const projects = await Project.find({ organizationId }).populate('members', 'name email avatar').sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { id } = req.params;

    const project = await Project.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId }).populate('members', 'name email avatar').populate('createdBy', 'name email avatar');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const { id } = req.params;

    const project = await Project.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), organizationId },
      { $set: req.body },
      { new: true }
    );
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
