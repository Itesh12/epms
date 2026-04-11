import express from 'express';
import * as authController from './auth.controller';
import * as passwordController from './password.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimit';
import { auditLog } from '../../middleware/audit';


const router = express.Router();

// Auth routes with security hardening
router.post('/signup-admin', authRateLimiter, auditLog('SIGNUP_ADMIN', 'AUTH'), authController.registerAdmin);
router.post('/signup-employee', authRateLimiter, auditLog('SIGNUP_EMPLOYEE', 'AUTH'), authController.registerEmployee);
router.post('/login', authRateLimiter, auditLog('LOGIN', 'AUTH'), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);


// Password Reset Routes
router.post('/forgot-password', passwordController.requestReset);
router.post('/reset-password', passwordController.verifyAndReset);
router.post('/generate-reset-code/:userId', authenticate, authorize(['ADMIN', 'HR']), passwordController.generateResetCode);

export default router;
