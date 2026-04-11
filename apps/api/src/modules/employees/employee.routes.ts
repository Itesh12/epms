import express from 'express';
import * as controller from './employee.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);

router.get('/', authorize(['ADMIN', 'MANAGER', 'HR']), controller.getAllEmployees);
router.get('/:id', authorize(['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE']), controller.getEmployeeById);
router.patch('/:id', authorize(['ADMIN', 'HR']), controller.updateEmployee);
router.delete('/:id', authorize(['ADMIN']), controller.deleteEmployee);

export default router;
