import { makeAutoObservable } from 'mobx';
import {
  getIncomingNotifications,
  getNotificationById,
  getOutgoingNotifications,
  sendCollaborationNotification,
  sendNeedResponseNotification,
} from 'shared/api/service/Notification/api';
import type {
  GetNotificationsParams,
  Notification,
  NotificationType,
  SendCollaborationRequest,
  SendNeedResponseRequest,
} from 'shared/api/service/Notification/types';

export class NotificationsStore {
  incoming: Notification[] = [];
  outgoing: Notification[] = [];
  isLoadingIncoming = false;
  isLoadingOutgoing = false;
  isSending = false;

  constructor() {
    makeAutoObservable(this);
  }

  fetchIncomingAction = async (params?: GetNotificationsParams) => {
    if (this.isLoadingIncoming) return;
    this.isLoadingIncoming = true;
    try {
      const data = await getIncomingNotifications(params);
      this.incoming = data;
    } catch {
      // silent
    } finally {
      this.isLoadingIncoming = false;
    }
  };

  fetchOutgoingAction = async (params?: GetNotificationsParams) => {
    if (this.isLoadingOutgoing) return;
    this.isLoadingOutgoing = true;
    try {
      const data = await getOutgoingNotifications(params);
      this.outgoing = data;
    } catch {
      // silent
    } finally {
      this.isLoadingOutgoing = false;
    }
  };

  markAsReadAction = async (id: number): Promise<Notification | null> => {
    try {
      const updated = await getNotificationById(id);
      this.incoming = this.incoming.map((n) => (n.id === id ? updated : n));
      return updated;
    } catch {
      return null;
    }
  };

  sendCollaborationAction = async (
    request: SendCollaborationRequest,
  ): Promise<boolean> => {
    this.isSending = true;
    try {
      const created = await sendCollaborationNotification(request);
      this.outgoing = [created, ...this.outgoing];
      return true;
    } catch (error) {
      console.error('Failed to send collaboration notification:', error);
      return false;
    } finally {
      this.isSending = false;
    }
  };

  sendNeedResponseAction = async (
    request: SendNeedResponseRequest,
  ): Promise<boolean> => {
    this.isSending = true;
    try {
      const created = await sendNeedResponseNotification(request);
      this.outgoing = [created, ...this.outgoing];
      return true;
    } catch (error) {
      console.error('Failed to send need response notification:', error);
      return false;
    } finally {
      this.isSending = false;
    }
  };

  get unreadCount(): number {
    return this.incoming.filter((n) => !n.isRead).length;
  }

  get incomingByType(): (type: NotificationType) => Notification[] {
    return (type) => this.incoming.filter((n) => n.type === type);
  }

  reset = (): void => {
    this.incoming = [];
    this.outgoing = [];
    this.isLoadingIncoming = false;
    this.isLoadingOutgoing = false;
    this.isSending = false;
  };
}
