import express from 'express';
import * as projectsController from './projects.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', projectsController.createProject);
router.get('/', projectsController.getProjects);
router.get('/:id', projectsController.getProjectById);
router.patch('/:id', projectsController.updateProject);

export default router;
