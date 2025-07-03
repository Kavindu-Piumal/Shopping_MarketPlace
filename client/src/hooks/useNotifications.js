import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useSocket } from '../context/SocketContext';

/**
 * Custom hook for managing notifications
 * Real-time notifications from backend API
 */
export const useNotifications = () => {
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
      // If error, keep using empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await Axios({
        ...summaryApi.markNotificationAsRead,
        url: summaryApi.markNotificationAsRead.url.replace(':notificationId', notificationId)
      });
      
      if (response.data.success) {
        // Update local state immediately
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications (delete them completely)
  const clearAll = async () => {
    try {
      console.log('🗑️ Attempting to clear all notifications...');
      
      const response = await Axios({
        ...summaryApi.deleteAllNotifications
      });
      
      console.log('📨 Clear all response:', response.data);
      
      if (response.data.success) {
        // Clear local state immediately
        setNotifications([]);
        setUnreadCount(0);
        
        console.log(`✅ Cleared ${response.data.data?.deletedCount || 0} notifications`);
        return { success: true, deletedCount: response.data.data?.deletedCount || 0 };
      } else {
        console.error('❌ Clear all failed:', response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('💥 Error clearing all notifications:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { success: false, error: error.message };
    }
  };

  // Delete specific notification
  const deleteNotification = async (notificationId) => {
    try {
      console.log(`🗑️ Deleting notification: ${notificationId}`);
      
      const response = await Axios({
        ...summaryApi.deleteNotification,
        url: summaryApi.deleteNotification.url.replace(':notificationId', notificationId)
      });
      
      console.log('📨 Delete response:', response.data);
      
      if (response.data.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Decrease unread count if it was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        console.log(`✅ Notification ${notificationId} deleted successfully`);
        return { success: true };
      } else {
        console.error('❌ Delete failed:', response.data.message);
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error(`💥 Error deleting notification ${notificationId}:`, error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { success: false, error: error.message };
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      // Use replace to avoid back button issues and prevent multiple navigations
      navigate(notification.actionUrl, { replace: true });
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user?._id]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket || !isConnected || !user?._id) return;

    console.log('🔔 Setting up real-time notification listeners');

    // Listen for new notifications
    const handleNewNotification = (data) => {
      console.log('🔔 Received new notification via socket:', data);
      
      // Add new notification to the beginning of the array
      setNotifications(prev => {
        const updated = [data.notification, ...prev];
        console.log(`📊 Notifications updated: ${updated.length} total notifications`);
        return updated;
      });
      
      // Update unread count
      setUnreadCount(prev => {
        const newCount = prev + 1;
        console.log(`📊 Unread count updated: ${prev} → ${newCount}`);
        return newCount;
      });
    };

    // Listen for notification updates (like mark as read)
    const handleNotificationUpdate = (data) => {
      console.log('🔔 Notification updated via socket:', data);
      
      if (data.updates.deleted) {
        // Remove deleted notification
        setNotifications(prev => {
          const updated = prev.filter(notif => notif._id !== data.notificationId);
          console.log(`📊 Notification deleted: ${prev.length} → ${updated.length} notifications`);
          return updated;
        });
      } else {
        // Update existing notification
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === data.notificationId
              ? { ...notif, ...data.updates }
              : notif
          )
        );
      }
      
      // Update unread count
      setUnreadCount(prev => {
        const newCount = data.unreadCount;
        console.log(`📊 Unread count updated via socket: ${prev} → ${newCount}`);
        return newCount;
      });
    };

    // Listen for bulk notification updates (like clear all)
    const handleNotificationBulkUpdate = (data) => {
      console.log('🔔 Bulk notification update via socket:', data);
      
      if (data.type === 'clear_all') {
        setNotifications(prev => {
          console.log(`📊 All notifications cleared: ${prev.length} → 0 notifications`);
          return [];
        });
        setUnreadCount(prev => {
          console.log(`📊 Unread count cleared: ${prev} → 0`);
          return 0;
        });
      }
    };

    // Set up socket listeners
    socket.on('new_notification', handleNewNotification);
    socket.on('notification_updated', handleNotificationUpdate);
    socket.on('notifications_bulk_update', handleNotificationBulkUpdate);

    // Cleanup listeners
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
    clearAll,
    markAsRead,
    deleteNotification,
    fetchNotifications
  };
};
