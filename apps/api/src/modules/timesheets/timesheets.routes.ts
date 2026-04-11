import express from 'express';
import * as timesheetsController from './timesheets.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', timesheetsController.getTimesheet);
router.patch('/:id/entries', timesheetsController.saveTimesheetEntries);
router.post('/:id/submit', timesheetsController.submitTimesheet);

export default router;
