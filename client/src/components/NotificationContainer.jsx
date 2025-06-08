import React from 'react';
import CustomNotification from './CustomNotification';

const NotificationContainer = ({ notifications, onClose }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <CustomNotification
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
