import Notification from '../models/notification.model.js';

// Get user notifications
export const getUserNotificationsController = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userId })
      .populate('data.senderId', 'name avatar')
      .populate('data.orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      message: "Notifications retrieved successfully",
      error: false,
      success: true,
      data: {
        notifications,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(await Notification.countDocuments({ userId }) / limit)
      }
    });
  } catch (error) {
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

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    );

    res.json({
      message: "Notification marked as read",
      error: false,
      success: true
    });
  } catch (error) {
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

// Create notification (internal function)
export const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    // TODO: Add socket.io real-time notification here
    // if (io) {
    //   io.to(`user_${data.userId}`).emit('new_notification', {
    //     ...notification.toObject(),
    //     unreadCount: await Notification.countDocuments({ 
    //       userId: data.userId, 
    //       read: false 
    //     })
    //   });
    // }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper function to create order notifications
export const createOrderNotification = async (order, type, recipientId) => {
  const notificationMap = {
    order_placed: {
      title: 'New Order Received!',
      message: `You received a new order #${order.orderNumber || order._id} worth ₹${order.totalAmount}`,
      actionUrl: `/chat`,
      icon: 'shopping-bag'
    },
    order_confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber || order._id} has been confirmed by seller`,
      actionUrl: `/myorders`,
      icon: 'check-circle'
    },
    order_shipped: {
      title: 'Order Shipped',
      message: `Your order #${order.orderNumber || order._id} has been shipped`,
      actionUrl: `/myorders`,
      icon: 'truck'
    },
    order_delivered: {
      title: 'Order Delivered',
      message: `Your order #${order.orderNumber || order._id} has been delivered`,
      actionUrl: `/myorders`,
      icon: 'check-circle'
    }
  };

  const config = notificationMap[type];
  if (!config) return;

  return await createNotification({
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
  });
};

// Helper function to create message notifications
export const createMessageNotification = async (chatId, message, senderId, recipientId) => {
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
  });
};
