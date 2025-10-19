import { useEffect } from 'react';
import { useNotificationStore } from '../store/notifications';

export const useNotificationShortcuts = () => {
  const { toggleDropdown, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + Shift + N: Toggle notification dropdown
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        toggleDropdown();
      }

      // Ctrl/Cmd + Shift + M: Mark all notifications as read
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        markAllAsRead();
      }

      // Ctrl/Cmd + Shift + C: Clear all notifications
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        clearAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDropdown, markAllAsRead, clearAll]);
};
