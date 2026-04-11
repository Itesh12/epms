import { Response } from 'express';
import mongoose from 'mongoose';
import Timesheet from '../../models/Timesheet';
import ApprovalRequest from '../../models/ApprovalRequest';
import ApprovalFlow from '../../models/ApprovalFlow';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const getTimesheet = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { date } = req.query; // Send any date in the week

    const queryDate = date ? new Date(date) : new Date();
    const startDate = startOfWeek(queryDate, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(queryDate, { weekStartsOn: 1 }); // Sunday

    let timesheet = await Timesheet.findOne({ organizationId, userId, startDate });

    if (!timesheet) {
      timesheet = new Timesheet({
        organizationId,
        userId,
        startDate,
        endDate,
        status: 'DRAFT',
        entries: [],
        totalHours: 0
      });
      await timesheet.save();
    }

    res.status(200).json(timesheet);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveTimesheetEntries = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { id } = req.params;
    const { entries } = req.body; // Array of entries

    const timesheet = await Timesheet.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId, userId });
    if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });
    if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
      return res.status(400).json({ message: 'Cannot edit a submitted timesheet' });
    }

    timesheet.entries = entries.map((e: any) => ({
      ...e,
      taskId: e.taskId ? new mongoose.Types.ObjectId(e.taskId) : undefined,
      projectId: e.projectId ? new mongoose.Types.ObjectId(e.projectId) : undefined,
    }));
    
    timesheet.totalHours = entries.reduce((sum: number, e: any) => sum + (Number(e.hoursLogged) || 0), 0);

    await timesheet.save();
    res.status(200).json(timesheet);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitTimesheet = async (req: any, res: Response) => {
  try {
    const organizationId = new mongoose.Types.ObjectId(req.user.organizationId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { id } = req.params;

    const timesheet = await Timesheet.findOne({ _id: new mongoose.Types.ObjectId(id), organizationId, userId });
    if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });

    if (timesheet.status !== 'DRAFT' && timesheet.status !== 'REJECTED') {
      return res.status(400).json({ message: 'Timesheet already submitted' });
    }

    timesheet.status = 'SUBMITTED';

    // Find custom workflow rules
    const flow = await ApprovalFlow.findOne({ organizationId, targetType: 'TIMESHEET', isActive: true });

    // Create ApprovalRequest tracking entity connecting to the Generalized Engine
    const approvalRequest = new ApprovalRequest({
      organizationId,
      targetId: timesheet._id,
      targetType: 'TIMESHEET',
      flowId: flow?._id,
      requesterId: userId,
      currentStepOrder: 1,
      status: 'PENDING',
      history: []
    });

    await approvalRequest.save();

    timesheet.approvalRequestId = approvalRequest.id;
    await timesheet.save();

    res.status(200).json(timesheet);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
