import express from 'express';
import * as authController from './auth.controller';
import * as passwordController from './password.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

router.post('/signup-admin', authController.registerAdmin);
router.post('/signup-employee', authController.registerEmployee);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// Password Reset Routes
router.post('/forgot-password', passwordController.requestReset);
router.post('/reset-password', passwordController.verifyAndReset);
router.post('/generate-reset-code/:userId', authenticate, authorize(['ADMIN', 'HR']), passwordController.generateResetCode);

export default router;
