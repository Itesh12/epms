import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { EmployeeRepository } from './employee.repository';

const repo = new EmployeeRepository();

export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await repo.findByOrg(req.user!.orgId!);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await repo.findOneByOrg(req.user!.orgId!, { _id: req.params.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await repo.updateByOrg(req.user!.orgId!, req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Employee not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await repo.deleteByOrg(req.user!.orgId!, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
