import { Response } from 'express';
import AttendanceCorrection from '../../models/AttendanceCorrection';
import Attendance from '../../models/Attendance';
import mongoose from 'mongoose';

export const submitCorrection = async (req: any, res: Response) => {
  try {
    const { attendanceId, correctionType, requestedTime, reason } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const correction = new AttendanceCorrection({
      attendanceId,
      userId,
      organizationId,
      correctionType,
      requestedTime,
      reason,
      status: 'PENDING'
    });

    await correction.save();
    res.status(201).json(correction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingCorrections = async (req: any, res: Response) => {
  try {
    const organizationId = req.user.organizationId;
    const corrections = await AttendanceCorrection.find({ 
      organizationId, 
      status: 'PENDING' 
    }).populate('userId', 'name email employeeId');

    res.status(200).json(corrections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveCorrection = async (req: any, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const adminId = req.user.userId;

    const correction = await AttendanceCorrection.findById(id).session(session);
    if (!correction) {
      return res.status(404).json({ message: 'Correction request not found.' });
    }

    if (correction.status !== 'PENDING') {
      return res.status(400).json({ message: 'Request already processed.' });
    }

    // Update Attendance record
    const attendance = await Attendance.findById(correction.attendanceId).session(session);
    if (attendance) {
      if (correction.correctionType === 'CHECK_IN') {
        attendance.checkInTime = correction.requestedTime;
      } else if (correction.correctionType === 'CHECK_OUT') {
        attendance.checkOutTime = correction.requestedTime;
      }
      
      // Recalculate totals after correction (optional: can be complex if it involves activity timestamps)
      // For now, we update the primary fields.
      await attendance.save({ session });
    }

    correction.status = 'APPROVED';
    correction.reviewedBy = adminId;
    correction.reviewedAt = new Date();
    correction.adminComment = adminComment;

    await correction.save({ session });
    await session.commitTransaction();

    res.status(200).json(correction);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const rejectCorrection = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { adminComment } = req.body;
    const adminId = req.user.userId;

    const correction = await AttendanceCorrection.findByIdAndUpdate(id, {
      status: 'REJECTED',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminComment
    }, { new: true });

    res.status(200).json(correction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
