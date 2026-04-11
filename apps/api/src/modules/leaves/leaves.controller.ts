import { Response } from 'express';
import mongoose from 'mongoose';
import Leave from '../../models/Leave';
import ApprovalRequest from '../../models/ApprovalRequest';
import ApprovalFlow from '../../models/ApprovalFlow';

export const requestLeave = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = new Leave({
      organizationId,
      userId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'PENDING'
    });

    await leave.save();

    // Trigger Approval Flow
    const flow = await ApprovalFlow.findOne({ organizationId, targetType: 'LEAVE', isActive: true });

    const approvalRequest = new ApprovalRequest({
      organizationId,
      targetId: leave._id,
      targetType: 'LEAVE',
      flowId: flow?._id,
      requesterId: userId,
      currentStepOrder: 1,
      status: 'PENDING',
      history: []
    });

    await approvalRequest.save();

    leave.approvalRequestId = approvalRequest.id;
    await leave.save();

    res.status(201).json(leave);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaves = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const leaves = await Leave.find({ organizationId, userId }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
