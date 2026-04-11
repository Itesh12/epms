import express from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER', 'HR']));

router.get('/attendance', analyticsController.getAttendanceAnalytics);
router.get('/productivity', analyticsController.getProductivityAnalytics);
router.get('/projects', analyticsController.getProjectPerformance);
router.get('/insights', analyticsController.getInsights);

export default router;
