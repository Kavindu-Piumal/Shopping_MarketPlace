import React, { useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import NotificationsMenu from "./NotificationsMenu";

/**
 * NotificationPanel component - Simplified version without conflicting event handlers
 */
const FixedNotificationPanel = ({
  isOpen,
  toggleOpen,
  close,
  unreadCount,
  isMobile = false
}) => {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle bell icon click
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleOpen();
  };

  // Handle clicks outside - simplified version
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Only close if clicking outside both button and dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        close();
      }
    };

    // Small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);

  return (
    <div className="relative" style={{ zIndex: 50 }}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`${
          isMobile
            ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 p-2 rounded-full"
            : "flex items-center gap-2 text-emerald-700 hover:text-emerald-900 p-2 rounded-full hover:bg-emerald-50"
        } transition-colors relative`}
        aria-label="Notifications"
      >
        <FaBell size={isMobile ? 22 : 20} />
        {unreadCount > 0 && (
          <span
            className={`absolute ${
              isMobile ? "-top-2 -right-1" : "-top-1 -right-1"
            } bg-red-500 text-white ${
              isMobile ? "text-xs" : "text-xs"
            } rounded-full ${
              isMobile
                ? "flex items-center justify-center font-medium"
                : "w-4 h-4 flex items-center justify-center font-medium min-w-4"
            }`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={close}
              aria-hidden="true"
            />
          )}

          {/* Notification Panel */}
          <div
            ref={dropdownRef}
            className={`${
              isMobile
                ? "fixed left-4 right-4 top-20"
                : "absolute right-0 top-12"
            } z-50`}
          >
            <div
              className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${
                isMobile ? "max-h-[70vh] overflow-y-auto" : ""
              }`}
            >
              <NotificationsMenu close={close} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FixedNotificationPanel;
