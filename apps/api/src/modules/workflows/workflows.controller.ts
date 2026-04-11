import { Response } from 'express';
import mongoose from 'mongoose';
import ApprovalFlow from '../../models/ApprovalFlow';
import ApprovalRequest from '../../models/ApprovalRequest';
import Timesheet from '../../models/Timesheet';
import Leave from '../../models/Leave';
import AttendanceCorrection from '../../models/AttendanceCorrection';

export const createFlow = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

    const { name, targetType, steps } = req.body;
    const flow = new ApprovalFlow({ organizationId, name, targetType, steps });
    await flow.save();
    
    res.status(201).json(flow);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlows = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const flows = await ApprovalFlow.find({ organizationId });
    res.status(200).json(flows);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingApprovals = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    // Ideally, we'd check if `req.user.role` matches the `requiredRole` of the `currentStepOrder`
    // Or if `requiredRole` is 'DIRECT_MANAGER', check if `requester.managerId === req.user.id`.
    // For simplicity in this system, we will just fetch all PENDING requests for the org 
    // and let the frontend filter, or we can filter here.
    
    // We'll fetch all pending requests. In a full production system, we'd do an aggregation pipeline joining the Flow steps and User info.
    const requests = await ApprovalRequest.find({ 
      organizationId, 
      status: 'PENDING' 
    }).populate('requesterId', 'name email avatar role').populate('flowId');
    
    res.status(200).json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const actionApproval = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { id } = req.params;
    const { action, comment } = req.body; // action: 'APPROVE' or 'REJECT'

    const request = await ApprovalRequest.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId }).populate('flowId');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ message: 'Request is no longer pending' });

    const flow: any = request.flowId;
    const currentStep = request.currentStepOrder;
    
    request.history.push({
      stepOrder: currentStep,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      reviewedBy: userId,
      comment,
      reviewedAt: new Date()
    });

    if (action === 'REJECT') {
      request.status = 'REJECTED';
    } else {
      // Approve logic
      const totalSteps = flow ? flow.steps.length : 1; // Fallback if no specific flow
      if (currentStep >= totalSteps) {
        request.status = 'APPROVED';
      } else {
        request.currentStepOrder += 1;
      }
    }

    await request.save();

    // Side effects on target
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      const syncStatus = request.status;
      if (request.targetType === 'TIMESHEET') {
        await Timesheet.updateOne({ _id: request.targetId }, { status: syncStatus });
      } else if (request.targetType === 'LEAVE') {
        await Leave.updateOne({ _id: request.targetId }, { status: syncStatus });
      } else if (request.targetType === 'ATTENDANCE_CORRECTION') {
        await AttendanceCorrection.updateOne({ _id: request.targetId }, { status: syncStatus });
      }
    }

    res.status(200).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
