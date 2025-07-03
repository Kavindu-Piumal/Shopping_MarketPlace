import React, { useState } from 'react';
import { FaBell, FaShoppingBag, FaCheckCircle, FaTruck, FaCommentDots, FaTag, FaStore, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../hooks/useNotifications';

const getNotificationIcon = (type) => {
  const iconMap = {
    'order_placed': FaShoppingBag,
    'order_confirmed': FaCheckCircle,
    'order_shipped': FaTruck,
    'order_delivered': FaCheckCircle,
    'message_received': FaCommentDots,
    'deal': FaTag,
    'shop': FaStore,
    'default': FaBell
  };
  return iconMap[type] || iconMap.default;
};

const getNotificationColor = (type) => {
  const colorMap = {
    'order_placed': 'text-green-600',
    'order_confirmed': 'text-blue-600',
    'order_shipped': 'text-purple-600',
    'order_delivered': 'text-green-600',
    'message_received': 'text-indigo-600',
    'deal': 'text-red-600',
    'shop': 'text-emerald-600',
    'default': 'text-gray-600'
  };
  return colorMap[type] || colorMap.default;
};

const getNotificationBgColor = (type) => {
  const bgColorMap = {
    'order_placed': 'bg-green-50',
    'order_confirmed': 'bg-blue-50',
    'order_shipped': 'bg-purple-50',
    'order_delivered': 'bg-green-50',
    'message_received': 'bg-indigo-50',
    'deal': 'bg-red-50',
    'shop': 'bg-emerald-50',
    'default': 'bg-gray-50'
  };
  return bgColorMap[type] || bgColorMap.default;
};

const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationsMenu = ({ close }) => {
  const { notifications, handleNotificationClick, clearAll, deleteNotification, loading, fetchNotifications } = useNotifications();
  const [clickedNotification, setClickedNotification] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState(null);

  const handleNotificationClickWithLoading = async (notification) => {
    if (clickedNotification === notification._id) return; // Prevent double clicks
    
    setClickedNotification(notification._id);
    try {
      await handleNotificationClick(notification);
      close(); // Close menu after successful click
    } catch (error) {
      console.error('Error handling notification click:', error);
    } finally {
      setClickedNotification(null);
    }
  };

  const handleClearAll = async () => {
    if (clearingAll) return; // Prevent double clicks
    
    setClearingAll(true);
    try {
      const result = await clearAll();
      if (!result.success) {
        console.error('Clear all failed:', result.error);
        // Optionally show error message to user
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setClearingAll(false);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Prevent triggering the notification click
    
    if (deletingNotification === notificationId) return; // Prevent double clicks
    
    setDeletingNotification(notificationId);
    try {
      const result = await deleteNotification(notificationId);
      if (!result.success) {
        console.error('Delete notification failed:', result.error);
        // Optionally show error message to user
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingNotification(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-xs sm:max-w-sm lg:w-80 lg:max-w-none max-h-96 p-4">
        <div className="animate-pulse flex items-center justify-center py-8">
          <FaBell className="text-2xl text-gray-300 mr-2" />
          <span className="text-gray-500">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs sm:max-w-sm lg:w-80 lg:max-w-none max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaBell className="text-emerald-600" />
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className={`text-xs font-medium transition-colors ${
                clearingAll 
                  ? 'text-gray-400 cursor-wait' 
                  : 'text-emerald-600 hover:text-emerald-800'
              }`}
            >
              {clearingAll ? 'Clearing...' : 'Clear All'}
            </button>
          )}
          {/* Debug: Manual refresh button - remove in production */}
          <button
            onClick={() => {
              console.log('🔄 Manual refresh notifications');
              fetchNotifications();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh notifications (debug)"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            const iconColor = getNotificationColor(notif.type);
            const bgColor = getNotificationBgColor(notif.type);
            
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClickWithLoading(notif)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  clickedNotification === notif._id 
                    ? 'opacity-50 cursor-wait' 
                    : notif.read ? 'bg-gray-50' : `${bgColor} border border-emerald-200`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${notif.read ? 'bg-gray-200' : bgColor}`}>
                    <Icon className={`text-sm ${notif.read ? 'text-gray-500' : iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notif.title}
                    </p>
                    <p className={`text-xs mt-1 ${notif.read ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatNotificationTime(notif.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notif.read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => handleDeleteNotification(e, notif._id)}
                      disabled={deletingNotification === notif._id}
                      className={`p-1 rounded-full transition-colors ${
                        deletingNotification === notif._id
                          ? 'text-gray-400 cursor-wait'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Delete notification"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No new notifications</p>
          <p className="text-gray-400 text-xs mt-1">
            You'll see notifications here when you receive orders, messages, or updates
          </p>
        </div>
      )}

      {/* Footer - Desktop Only */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3 hidden lg:block">
          <button
            onClick={close}
            className="w-full text-center text-emerald-600 hover:text-emerald-800 text-sm font-medium py-2"
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
