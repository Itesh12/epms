import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { EmployeeRepository } from './employee.repository';
import User from '../../models/User';
import mongoose from 'mongoose';

const repo = new EmployeeRepository();

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const user = await User.findById(userId).select('-passwordHash -resetPasswordCode -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await repo.findByOrg(req.user!.organizationId!);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await repo.findOneByOrg(req.user!.organizationId!, { _id: req.params.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await repo.updateByOrg(req.user!.organizationId!, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await repo.deleteByOrg(req.user!.organizationId!, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
