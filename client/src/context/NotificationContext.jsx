import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const REMOVE_NOTIFICATIONS_BY_TYPE = 'REMOVE_NOTIFICATIONS_BY_TYPE';
const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';

// Initial state
const initialState = {
  notifications: []
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    case REMOVE_NOTIFICATIONS_BY_TYPE:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.category !== action.payload
        )
      };
    case CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return Date.now() + Math.random();
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const id = generateId();
    dispatch({
      type: ADD_NOTIFICATION,
      payload: {
        id,
        type: 'info', // default type
        duration: 3500, // default duration
        ...notification
      }
    });
    return id;
  }, [generateId]);
  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: REMOVE_NOTIFICATION, payload: id });
  }, []);

  // Remove notifications by category
  const removeNotificationsByCategory = useCallback((category) => {
    dispatch({ type: REMOVE_NOTIFICATIONS_BY_TYPE, payload: category });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: CLEAR_ALL_NOTIFICATIONS });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  // Custom notification with React elements (for login buttons, etc.)
  const showCustom = useCallback((config) => {
    return addNotification(config);
  }, [addNotification]);
  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    removeNotificationsByCategory,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
