import React from 'react';
import { FaBell, FaShoppingBag, FaCheckCircle, FaTruck, FaCommentDots, FaTag, FaStore, FaTimes } from 'react-icons/fa';

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

/**
 * Individual notification item component
 */
const NotificationItem = ({ notification, onClick, onDelete }) => {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const bgColor = getNotificationBgColor(notification.type);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 m-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        notification.read ? 'bg-gray-50' : `${bgColor} border border-emerald-200`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-200' : bgColor}`}>
          <Icon className={`text-sm ${notification.read ? 'text-gray-500' : iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
            {notification.title}
          </p>
          <p className={`text-xs mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!notification.read && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          )}
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded-full transition-colors text-gray-400 hover:text-red-500 hover:bg-red-50"
            title="Delete notification"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
