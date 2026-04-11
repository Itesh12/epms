import express from 'express';
import * as tasksController from './tasks.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', tasksController.createTask);
router.get('/project/:projectId', tasksController.getTasksByProject);
router.patch('/:id', tasksController.updateTask);
router.post('/:id/comments', tasksController.addComment);
router.post('/:id/time', tasksController.addTime);

export default router;
