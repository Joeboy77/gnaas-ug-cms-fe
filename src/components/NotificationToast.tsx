import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationToastProps {
  notificationId: string;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return 'ℹ️';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notificationId, 
  onClose 
}) => {
  const { notifications, markAsRead } = useNotificationStore();
  const [isVisible, setIsVisible] = useState(false);
  
  const notification = notifications.find(n => n.id === notificationId);
  
  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const handleClick = () => {
    markAsRead(notification.id);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          rounded-lg border p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow
          ${getNotificationColor(notification.type)}
        `}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="text-lg flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {notification.title}
            </h4>
            <p className="text-xs mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-75">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              {notification.actionUrl && notification.actionText && (
                <button
                  className="text-xs font-medium underline hover:no-underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = notification.actionUrl!;
                  }}
                >
                  {notification.actionText}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-lg opacity-50 hover:opacity-75 transition-opacity"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
