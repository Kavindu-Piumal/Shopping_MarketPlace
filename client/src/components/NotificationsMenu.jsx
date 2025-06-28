import React from 'react';
import { FaBell, FaShoppingBag, FaCheckCircle, FaTruck, FaCommentDots, FaTag, FaStore } from 'react-icons/fa';
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
  const { notifications, handleNotificationClick, clearAll, loading } = useNotifications();

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
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Clear All
          </button>
        )}
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
                onClick={() => {
                  handleNotificationClick(notif);
                  close();
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  notif.read ? 'bg-gray-50' : `${bgColor} border border-emerald-200`
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
                  {!notif.read && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
                  )}
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
