import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotificationStore } from '../store/notifications';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notificationService: typeof notificationService;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { notifications, markAsRead, removeNotification } = useNotificationStore();

  // Auto-clear old notifications (older than 7 days)
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const oldNotifications = notifications.filter(
        notification => notification.timestamp < sevenDaysAgo
      );
      
      oldNotifications.forEach(notification => {
        removeNotification(notification.id);
      });
    };

    // Clean up on mount
    cleanupOldNotifications();
    
    // Set up interval to clean up every hour
    const interval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [notifications, removeNotification]);

  // Auto-mark notifications as read when user interacts with the app
  useEffect(() => {
    const handleUserActivity = () => {
      // Mark notifications as read after 5 seconds of user activity
      setTimeout(() => {
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          // Only auto-mark info and success notifications, not warnings or errors
          unreadNotifications.forEach(notification => {
            if (notification.type === 'info' || notification.type === 'success') {
              markAsRead(notification.id);
            }
          });
        }
      }, 5000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [notifications, markAsRead]);

  const contextValue: NotificationContextType = {
    notificationService,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};