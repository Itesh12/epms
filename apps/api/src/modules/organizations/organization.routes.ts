import express from 'express';
import * as orgController from './organization.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.post('/', authenticate, authorize(['ADMIN']), orgController.createOrganization);
router.get('/my', authenticate, authorize(['ADMIN']), orgController.getMyOrganizations);

export default router;
