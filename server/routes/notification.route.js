import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController
} from '../controllers/notification.controller.js';

const notificationRouter = Router();

notificationRouter.get('/', auth, getUserNotificationsController);
notificationRouter.patch('/:notificationId/read', auth, markNotificationAsReadController);
notificationRouter.patch('/mark-all-read', auth, markAllNotificationsAsReadController);

export default notificationRouter;
