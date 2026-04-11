import express from 'express';
import * as workflowsController from './workflows.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/flows', workflowsController.createFlow);
router.get('/flows', workflowsController.getFlows);
router.get('/pending', workflowsController.getPendingApprovals);
router.post('/action/:id', workflowsController.actionApproval);

export default router;
