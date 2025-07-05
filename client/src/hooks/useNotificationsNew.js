import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useSocket } from '../context/SocketContext';

/**
 * Fresh notification hook - completely rewritten for reliability
 */
export const useNotificationsNew = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { socket, isConnected } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user?._id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await Axios({
        ...summaryApi.getUserNotifications
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read and navigate
  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await Axios({
          ...summaryApi.markNotificationAsRead,
          url: summaryApi.markNotificationAsRead.url.replace(':notificationId', notification._id)
        });

        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notification._id
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to action URL if provided
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
        return true; // Indicate successful navigation
      }

      return false; // No navigation occurred
    } catch (error) {
      console.error('Error handling notification click:', error);
      return false;
    }
  };

  // Delete specific notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await Axios({
        ...summaryApi.deleteNotification,
        url: summaryApi.deleteNotification.url.replace(':notificationId', notificationId)
      });

      if (response.data.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));

        // Decrease unread count if it was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        return { success: true };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const response = await Axios({
        ...summaryApi.deleteAllNotifications
      });

      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
        return { success: true };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user?._id]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket || !isConnected || !user?._id) return;

    const handleNewNotification = (data) => {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationUpdate = (data) => {
      if (data.updates.deleted) {
        setNotifications(prev => prev.filter(notif => notif._id !== data.notificationId));
      } else {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === data.notificationId
              ? { ...notif, ...data.updates }
              : notif
          )
        );
      }

      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

    const handleNotificationBulkUpdate = (data) => {
      if (data.type === 'clear_all') {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_updated', handleNotificationUpdate);
    socket.on('notifications_bulk_update', handleNotificationBulkUpdate);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_updated', handleNotificationUpdate);
      socket.off('notifications_bulk_update', handleNotificationBulkUpdate);
    };
  }, [socket, isConnected, user?._id]);

  return {
    notifications,
    unreadCount,
    loading,
    handleNotificationClick,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications
  };
};

export default useNotificationsNew;
