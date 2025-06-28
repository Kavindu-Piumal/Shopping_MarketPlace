import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';

/**
 * Custom hook for managing notifications
 * Real-time notifications from backend API
 */
export const useNotifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  
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
      await Axios({
        ...summaryApi.markNotificationAsRead,
        url: summaryApi.markNotificationAsRead.url.replace(':id', notificationId)
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications (mark all as read)
  const clearAll = async () => {
    try {
      await Axios({
        ...summaryApi.markAllNotificationsAsRead
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user?._id]);

  return {
    notifications,
    unreadCount,
    loading,
    handleNotificationClick,
    clearAll,
    markAsRead,
    fetchNotifications
  };
};
