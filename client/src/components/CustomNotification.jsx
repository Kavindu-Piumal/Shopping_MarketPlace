import React, { useEffect } from 'react';
import { IoClose, IoCheckmarkCircle, IoAlertCircle, IoInformationCircle } from 'react-icons/io5';
import { PiWarningCircleFill } from "react-icons/pi";

const CustomNotification = ({ notification, onClose }) => {
  useEffect(() => {
    // Auto dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  // Get icon and colors based on notification type
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <IoCheckmarkCircle size={20} />,
          bgColor: 'bg-green-500',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          lightBg: 'bg-green-50'
        };
      case 'error':
        return {
          icon: <IoAlertCircle size={20} />,
          bgColor: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          lightBg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: <PiWarningCircleFill size={20} />,
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          lightBg: 'bg-yellow-50'
        };
      case 'info':
        return {
          icon: <IoInformationCircle size={20} />,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          lightBg: 'bg-blue-50'
        };
      default:
        return {
          icon: <IoInformationCircle size={20} />,
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          lightBg: 'bg-gray-50'
        };
    }
  };

  const styles = getNotificationStyles(notification.type);

  return (
    <div className={`
      ${styles.lightBg} ${styles.borderColor} ${styles.textColor}
      border-l-4 p-4 rounded-lg shadow-lg mb-3 
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right max-w-sm
      hover:shadow-xl
    `}>
      <div className="flex items-start">
        <div className={`${styles.bgColor} text-white rounded-full p-1 mr-3 flex-shrink-0`}>
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <p className="font-semibold text-sm mb-1">
              {notification.title}
            </p>
          )}
          <p className="text-sm leading-5">
            {notification.message}
          </p>
          
          {/* Custom content like buttons */}
          {notification.customContent && (
            <div className="mt-2">
              {notification.customContent}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onClose(notification.id)}
          className={`
            ${styles.textColor} hover:bg-gray-200 
            rounded-full p-1 ml-2 flex-shrink-0
            transition-colors duration-200
          `}
          aria-label="Close notification"
        >
          <IoClose size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomNotification;
