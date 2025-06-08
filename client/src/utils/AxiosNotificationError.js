import { useNotification } from '../context/NotificationContext';

// This will be used as a utility function
let notificationInstance = null;

// Set the notification instance from a component
export const setNotificationInstance = (instance) => {
  notificationInstance = instance;
};

// Axios error handler for notifications
const AxiosNotificationError = (error) => {
  if (!notificationInstance) {
    console.error('NotificationContext not available');
    return;
  }

  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      'An unexpected error occurred';
  
  notificationInstance.showError(errorMessage);
};

// Hook version for use in components
export const useAxiosNotificationError = () => {
  const { showError } = useNotification();
  
  return (error) => {
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'An unexpected error occurred';
    
    showError(errorMessage);
  };
};

export default AxiosNotificationError;
