import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import useNotificationsNew from '../hooks/useNotificationsNew';
import NotificationItem from './NotificationItem.jsx';

/**
 * Brand new notification panel - built from scratch for reliability
 */
const NotificationPanel = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    handleNotificationClick,
    deleteNotification,
    clearAllNotifications
  } = useNotificationsNew();

  // Handle outside clicks to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const handleNotificationItemClick = async (notification) => {
    const navigated = await handleNotificationClick(notification);
    if (navigated) {
      // Close panel after successful navigation
      setTimeout(() => setIsOpen(false), 100);
    }
  };

  const handleDeleteClick = async (notificationId, e) => {
    e.stopPropagation(); // Prevent triggering notification click
    await deleteNotification(notificationId);
    // Panel stays open after delete
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    await clearAllNotifications();
    // Panel stays open after clear all
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={togglePanel}
        className={`${
          isMobile
            ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 p-2 rounded-full'
            : 'flex items-center gap-2 text-emerald-700 hover:text-emerald-900 p-2 rounded-full hover:bg-emerald-50'
        } transition-colors relative`}
        aria-label="Notifications"
      >
        <FaBell size={isMobile ? 22 : 20} />
        {unreadCount > 0 && (
          <span
            className={`absolute ${
              isMobile ? '-top-2 -right-1' : '-top-1 -right-1'
            } bg-red-500 text-white text-xs rounded-full ${
              isMobile
                ? 'px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center font-medium'
                : 'w-4 h-4 flex items-center justify-center font-medium min-w-4'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={closePanel}
            />
          )}

          {/* Panel Content */}
          <div
            ref={panelRef}
            className={`${
              isMobile
                ? 'fixed left-4 right-4 top-20 z-50'
                : 'absolute right-0 top-12 z-50 w-80'
            }`}
          >
            <div
              className={`bg-white rounded-lg shadow-lg border border-gray-200 ${
                isMobile ? 'max-h-[70vh]' : 'max-h-96'
              } overflow-hidden`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaBell className="text-emerald-600" />
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    {isMobile && (
                      <button
                        onClick={closePanel}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaTimes className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`${isMobile ? 'max-h-[calc(70vh-80px)]' : 'max-h-80'} overflow-y-auto`}>
                {loading ? (
                  <div className="p-8 text-center">
                    <FaBell className="text-2xl text-gray-300 mx-auto mb-3" />
                    <span className="text-gray-500">Loading notifications...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onClick={() => handleNotificationItemClick(notification)}
                        onDelete={(e) => handleDeleteClick(notification._id, e)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaBell className="text-4xl text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No new notifications</p>
                    <p className="text-gray-400 text-xs mt-1">
                      You'll see notifications here when you receive orders, messages, or updates
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;
