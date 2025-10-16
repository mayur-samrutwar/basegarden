import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const updateNotification = useCallback((notificationData) => {
    const newNotification = {
      id: 'main',
      type: 'info', // 'success', 'error', 'info', 'loading'
      message: '',
      duration: 4000, // auto-dismiss after 4 seconds
      ...notificationData,
    };

    setNotification(newNotification);

    // Auto-dismiss after duration (only for non-loading notifications)
    if (newNotification.duration > 0 && newNotification.type !== 'loading') {
      setTimeout(() => {
        setNotification(null);
      }, newNotification.duration);
    }

    return 'main';
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{
      updateNotification,
      clearNotification,
      notification,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <NotificationItem
        notification={notification}
        onClose={clearNotification}
      />
    </div>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const { type, message } = notification;

  const getLoader = () => {
    if (type === 'loading') {
      return (
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            <div className="absolute top-0 left-0 w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    
    switch (type) {
      case 'success':
        return (
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className="
        pointer-events-auto
        bg-white
        border
        border-gray-200
        rounded-xl
        px-5
        py-4
        shadow-lg
        transform
        transition-all
        duration-300
        ease-out
        hover:shadow-xl
        max-w-sm
        min-w-[280px]
      "
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getLoader()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-900 font-medium text-sm leading-relaxed">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity duration-200"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Convenience functions for common notification types
export const useNotificationActions = () => {
  const { updateNotification } = useNotification();

  return {
    showLoading: (message) => updateNotification({
      type: 'loading',
      message,
      duration: 0, // Don't auto-dismiss loading notifications
    }),
    
    showSuccess: (message) => updateNotification({
      type: 'success',
      message,
      duration: 3000,
    }),
    
    showError: (message) => updateNotification({
      type: 'error',
      message,
      duration: 5000,
    }),
    
    showInfo: (message) => updateNotification({
      type: 'info',
      message,
      duration: 4000,
    }),
  };
};
