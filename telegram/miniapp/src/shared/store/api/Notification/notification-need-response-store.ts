import { makeAutoObservable } from 'mobx';
import {
  getIncomingNotifications,
  sendNeedResponseNotification,
} from 'shared/api/service/Notification/api';
import type {
  Notification,
  SendNeedResponseRequest,
} from 'shared/api/service/Notification/types';

export class NotificationNeedResponseStore {
  notifications: Notification[] = [];
  isLoading = false;
  isSending = false;

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
        type: 'Response',
      });
      this.notifications = data;
    } catch (error) {
      console.error('Failed to fetch need response notifications:', error);
    } finally {
      this.isLoading = false;
    }
  };

  sendNeedResponseAction = async (
    request: SendNeedResponseRequest,
  ): Promise<boolean> => {
    this.isSending = true;
    try {
      const created = await sendNeedResponseNotification(request);
      this.notifications = [created, ...this.notifications];
      return true;
    } catch (error) {
      console.error('Failed to send need response notification:', error);
      return false;
    } finally {
      this.isSending = false;
    }
  };

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}
