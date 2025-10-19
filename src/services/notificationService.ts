import { useNotificationStore } from '../store/notifications';

export const notificationService = {

  studentAdded(studentName: string, studentId: string) {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'New Student Added',
      message: `${studentName} has been successfully added to the system.`,
      actionUrl: `/secretary/students`,
      actionText: 'View Students',
      metadata: { studentId, studentName }
    });
  },

  studentUpdated(studentName: string, studentId: string) {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'Student Updated',
      message: `${studentName}'s information has been updated.`,
      actionUrl: `/secretary/students`,
      actionText: 'View Students',
      metadata: { studentId, studentName }
    });
  },

  // Attendance-related notifications
  attendanceMarked(studentName: string, date: string, type: 'member' | 'visitor') {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: `${type === 'member' ? 'Member' : 'Visitor'} Attendance Marked`,
      message: `${studentName} has been marked as present for ${date}.`,
      actionUrl: `/secretary/attendance`,
      actionText: 'View Attendance',
      metadata: { studentName, date, type }
    });
  },

  attendanceClosed(date: string) {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'Attendance Closed',
      message: `Attendance marking has been closed for ${date}.`,
      actionUrl: `/secretary/attendance`,
      actionText: 'View Attendance',
      metadata: { date }
    });
  },

  attendanceReminder(date: string, unmarkedCount: number) {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title: 'Attendance Reminder',
      message: `${unmarkedCount} members still need to be marked for ${date}.`,
      actionUrl: `/secretary/attendance`,
      actionText: 'Mark Attendance',
      metadata: { date, unmarkedCount }
    });
  },

  // System notifications
  systemMaintenance(scheduledTime: string) {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title: 'System Maintenance',
      message: `Scheduled maintenance will occur at ${scheduledTime}. Please save your work.`,
      metadata: { scheduledTime }
    });
  },

  systemError(error: string) {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'System Error',
      message: `An error occurred: ${error}`,
      metadata: { error }
    });
  },

  // Email notifications
  emailSent(recipient: string, type: 'welcome' | 'attendance') {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Email Sent',
      message: `${type === 'welcome' ? 'Welcome' : 'Attendance'} email sent to ${recipient}.`,
      metadata: { recipient, type }
    });
  },

  emailFailed(recipient: string, error: string) {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Email Failed',
      message: `Failed to send email to ${recipient}: ${error}`,
      metadata: { recipient, error }
    });
  },

  // Data export notifications
  dataExported(format: string, recordCount: number) {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Data Export Complete',
      message: `${recordCount} records exported in ${format} format.`,
      metadata: { format, recordCount }
    });
  },

  // Batch operations
  batchPromotionCompleted(fromLevel: string, toLevel: string, studentCount: number) {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Batch Promotion Complete',
      message: `${studentCount} students promoted from ${fromLevel} to ${toLevel}.`,
      metadata: { fromLevel, toLevel, studentCount }
    });
  },

  // Critical error that should show as toast
  criticalError(title: string, message: string, metadata?: any) {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      metadata,
      showAsToast: true
    });
  },

  // Custom notification
  custom(type: 'info' | 'success' | 'warning' | 'error', title: string, message: string, metadata?: any) {
    useNotificationStore.getState().addNotification({
      type,
      title,
      message,
      metadata
    });
  }
};
