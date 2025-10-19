import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/notifications';
import NotificationToast from './NotificationToast';

export const NotificationManager: React.FC = () => {
  const { notifications } = useNotificationStore();
  const [activeToasts, setActiveToasts] = useState<string[]>([]);

  useEffect(() => {
    const latestNotification = notifications[0];
    
    // Only show toast notifications if explicitly requested with showAsToast: true
    if (latestNotification && 
        !activeToasts.includes(latestNotification.id) &&
        latestNotification.showAsToast === true) {
      setActiveToasts(prev => [latestNotification.id, ...prev]);
    }
  }, [notifications, activeToasts]);

  const handleToastClose = (notificationId: string) => {
    setActiveToasts(prev => prev.filter(id => id !== notificationId));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {activeToasts.map((notificationId, index) => (
        <div
          key={notificationId}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index,
          }}
        >
          <NotificationToast
            notificationId={notificationId}
            onClose={() => handleToastClose(notificationId)}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;
