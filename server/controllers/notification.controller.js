import Notification from '../models/notification.model.js';

// Get user notifications
export const getUserNotificationsController = async (req, res) => {
  try {
    console.log('📥 getUserNotifications called');
    const userId = req.userId;
    console.log('👤 User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({
        message: "User not authenticated",
        error: true,
        success: false
      });
    }

    const { page = 1, limit = 20 } = req.query;
    console.log('📄 Query params - page:', page, 'limit:', limit);

    console.log('🔍 Fetching notifications for user:', userId);
    const notifications = await Notification.find({ userId })
      .populate('data.senderId', 'name avatar')
      .populate('data.orderId', 'orderId totalAmt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('📝 Found notifications:', notifications.length);

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    console.log('🔔 Unread count:', unreadCount);

    const totalNotifications = await Notification.countDocuments({ userId });
    console.log('📊 Total notifications:', totalNotifications);

    res.json({
      message: "Notifications retrieved successfully",
      error: false,
      success: true,
      data: {
        notifications,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error in getUserNotificationsController:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      message: error.message || "Failed to get notifications",
      error: true,
      success: false
    });
  }
};

// Mark notification as read
export const markNotificationAsReadController = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    console.log(`📖 Mark as read request - notificationId: ${notificationId}, userId: ${userId}`);

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        error: true,
        success: false
      });
    }

    // Emit real-time update for mark as read
    if (req.io) {
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        read: false 
      });

      console.log(`🔔 Emitting notification_updated for user ${userId}, new unread count: ${unreadCount}`);
      req.io.to(userId).emit('notification_updated', {
        notificationId,
        updates: { read: true, readAt: notification.readAt },
        unreadCount
      });
    }

    res.json({
      message: "Notification marked as read",
      error: false,
      success: true
    });
  } catch (error) {
    console.error('💥 Error in markNotificationAsReadController:', error);
    res.status(500).json({
      message: error.message || "Failed to mark notification as read",
      error: true,
      success: false
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      message: "All notifications marked as read",
      error: false,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to mark all notifications as read",
      error: true,
      success: false
    });
  }
};

// Delete all notifications
export const deleteAllNotificationsController = async (req, res) => {
  try {
    const userId = req.userId;

    console.log(`🗑️ Delete all notifications request for user: ${userId}`);

    const result = await Notification.deleteMany({ userId });

    console.log(`✅ Deleted ${result.deletedCount} notifications for user: ${userId}`);

    // Emit real-time update for clear all
    if (req.io) {
      console.log(`🔔 Emitting notifications_bulk_update for user ${userId}`);
      req.io.to(userId).emit('notifications_bulk_update', {
        type: 'clear_all',
        deletedCount: result.deletedCount
      });
    }

    res.json({
      message: `${result.deletedCount} notifications cleared successfully`,
      error: false,
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('💥 Error in deleteAllNotificationsController:', error);
    res.status(500).json({
      message: error.message || "Failed to clear all notifications",
      error: true,
      success: false
    });
  }
};

// Delete specific notification
export const deleteNotificationController = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    console.log(`🗑️ Delete notification request: ${notificationId} for user: ${userId}`);

    const result = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!result) {
      console.log(`❌ Notification not found: ${notificationId} for user: ${userId}`);
      return res.status(404).json({
        message: "Notification not found",
        error: true,
        success: false
      });
    }

    console.log(`✅ Deleted notification: ${notificationId} for user: ${userId}`);

    // Emit real-time update for delete notification
    if (req.io) {
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        read: false 
      });

      console.log(`🔔 Emitting notification deleted for user ${userId}, new unread count: ${unreadCount}`);
      req.io.to(userId).emit('notification_updated', {
        notificationId,
        updates: { deleted: true },
        unreadCount
      });
    }

    res.json({
      message: "Notification deleted successfully",
      error: false,
      success: true
    });
  } catch (error) {
    console.error(`💥 Error in deleteNotificationController:`, error);
    res.status(500).json({
      message: error.message || "Failed to delete notification",
      error: true,
      success: false
    });
  }
};

// Helper function to create a notification and emit via socket
export const createNotification = async (notificationData, io = null) => {
  // Create notification in DB
  const notification = await Notification.create(notificationData);

  // Emit real-time notification if socket instance is provided
  if (io && notificationData.userId) {
    io.to(notificationData.userId.toString()).emit('notification', notification);
  }

  return notification;
};

// Helper function to create order notifications
export const createOrderNotification = async (order, type, recipientId, io = null) => {
  console.log(`🔔 Creating notification - Type: ${type}, Recipient: ${recipientId}, Order: ${order._id}`);
  console.log(`💰 Order amount fields:`, {
    totalAmt: order.totalAmt,
    totalAmount: order.totalAmount,
    subTotalAmt: order.subTotalAmt
  });

  const notificationMap = {
    order_placed: {
      title: 'New Order Received!',
      message: `You received a new order #${order.orderId || order._id} worth LKR ${order.totalAmt}`,
      actionUrl: `/chat?orderId=${order._id}&with=${order.buyerId}`,
      icon: 'shopping-bag'
    },
    order_confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${order.orderId || order._id} has been confirmed by seller`,
      actionUrl: `/chat?orderId=${order._id}`,
      icon: 'check-circle'
    },
    order_shipped: {
      title: 'Order Shipped',
      message: `Your order #${order.orderId || order._id} has been shipped`,
      actionUrl: `/chat?orderId=${order._id}`,
      icon: 'truck'
    },
    order_delivered: {
      title: 'Order Delivered',
      message: `Your order #${order.orderId || order._id} has been delivered`,
      actionUrl: `/chat?orderId=${order._id}&with=${order.sellerId}`,
      icon: 'check-circle'
    }
  };

  const config = notificationMap[type];
  if (!config) {
    console.log(`❌ No notification config for type: ${type}`);
    return;
  }

  const notificationData = {
    userId: recipientId,
    type,
    title: config.title,
    message: config.message,
    data: {
      orderId: order._id,
      senderId: type === 'order_placed' ? order.buyerId : order.sellerId
    },
    actionUrl: config.actionUrl,
    icon: config.icon
  };

  console.log('📝 Notification data:', notificationData);

  try {
    const notification = await createNotification(notificationData, io);
    console.log(`✅ Notification created successfully:`, notification._id);
    return notification;
  } catch (error) {
    console.error(`❌ Error creating notification:`, error);
    throw error;
  }
};

// Helper function to create message notifications
export const createMessageNotification = async (chatId, message, senderId, recipientId, io = null) => {
  console.log(`📨 createMessageNotification called:`);
  console.log(`  - chatId: ${chatId}`);
  console.log(`  - senderId: ${senderId}`);
  console.log(`  - recipientId: ${recipientId}`);
  console.log(`  - message: ${message.substring(0, 50)}...`);

  return await createNotification({
    userId: recipientId,
    type: 'message_received',
    title: 'New Message',
    message: `You have a new message: "${message.substring(0, 50)}..."`,
    data: {
      chatId: chatId,
      senderId: senderId
    },
    actionUrl: `/chat`,
    icon: 'message'
  }, io);
};
