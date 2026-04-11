import express from 'express';
import * as leavesController from './leaves.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', leavesController.requestLeave);
router.get('/', leavesController.getMyLeaves);

export default router;
