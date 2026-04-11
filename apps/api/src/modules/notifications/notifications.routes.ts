import express from 'express';
import * as notificationsController from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationsController.getMyNotifications);
router.patch('/read/:id', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);

export default router;
