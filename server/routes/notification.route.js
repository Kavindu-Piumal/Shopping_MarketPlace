import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteAllNotificationsController,
  deleteNotificationController,
  createNotification
} from '../controllers/notification.controller.js';

const notificationRouter = Router();

notificationRouter.get('/', auth, getUserNotificationsController);
notificationRouter.patch('/:notificationId/read', auth, markNotificationAsReadController);
notificationRouter.patch('/mark-all-read', auth, markAllNotificationsAsReadController);
notificationRouter.delete('/clear-all', auth, deleteAllNotificationsController);
notificationRouter.delete('/:notificationId', auth, deleteNotificationController);

// Test route to create a test notification
notificationRouter.post('/test', auth, async (req, res) => {
  try {
    console.log('🧪 Creating test notification for user:', req.userId);
    const testNotification = await createNotification({
      userId: req.userId,
      type: 'order_placed',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working',
      data: {},
      actionUrl: '/test',
      icon: 'test'
    });
    
    res.json({
      message: "Test notification created successfully",
      error: false,
      success: true,
      data: testNotification
    });
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    res.status(500).json({
      message: error.message,
      error: true,
      success: false
    });
  }
});

export default notificationRouter;
