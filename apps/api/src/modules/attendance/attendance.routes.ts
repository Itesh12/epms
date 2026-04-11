import express from 'express';
import * as attendanceController from './attendance.controller';
import * as correctionController from './correction.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Core Tracking
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.post('/toggle-break', attendanceController.toggleBreak);
router.get('/status', attendanceController.getAttendanceStatus);
router.get('/reports', attendanceController.getReports);
router.get('/heatmap', attendanceController.getHeatmapData);
router.get('/dashboard-metrics', attendanceController.getDashboardStats);

// Corrections
router.post('/corrections', correctionController.submitCorrection);
router.get('/corrections/pending', authorize(['ADMIN', 'HR']), correctionController.getPendingCorrections);
router.patch('/corrections/:id/approve', authorize(['ADMIN', 'HR']), correctionController.approveCorrection);
router.patch('/corrections/:id/reject', authorize(['ADMIN', 'HR']), correctionController.rejectCorrection);

export default router;
