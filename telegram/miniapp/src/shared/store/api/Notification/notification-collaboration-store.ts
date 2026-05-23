import { makeAutoObservable } from 'mobx';
import {
  deleteNotification,
  getIncomingNotifications,
  sendCollaborationNotification,
} from 'shared/api/service/Notification/api';
import type {
  Notification,
  SendCollaborationRequest,
} from 'shared/api/service/Notification/types';

export class NotificationCollaborationStore {
  notifications: Notification[] = [];
  isLoading = false;
  isSending = false;
  isDeleting = false;

  constructor() {
    makeAutoObservable(this);
  }

  fetchNotificationsAction = async (params?: {
    limit?: number;
    offset?: number;
  }) => {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const data = await getIncomingNotifications({
        offset: params?.offset,
        size: params?.limit,
        type: 'Collaboration',
      });
      this.notifications = data;
    } catch (error) {
      console.error('Failed to fetch collaboration notifications:', error);
    } finally {
      this.isLoading = false;
    }
  };

  sendCollaborationAction = async (
    request: SendCollaborationRequest,
  ): Promise<boolean> => {
    this.isSending = true;
    try {
      const created = await sendCollaborationNotification(request);
      this.notifications = [created, ...this.notifications];
      return true;
    } catch (error) {
      console.error('Failed to send collaboration notification:', error);
      return false;
    } finally {
      this.isSending = false;
    }
  };

  deleteNotificationAction = async (id: number): Promise<boolean> => {
    if (this.isDeleting) return false;
    this.isDeleting = true;
    try {
      await deleteNotification(id);
      this.notifications = this.notifications.filter((n) => n.id !== id);
      return true;
    } catch (error) {
      console.error('Failed to delete collaboration notification:', error);
      return false;
    } finally {
      this.isDeleting = false;
    }
  };

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}
