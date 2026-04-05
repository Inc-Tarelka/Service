export type NotificationType =
  | 'Collaboration'
  | 'Response'
  | 'Notice'
  | 'TeamInvite';

export interface Notification {
  createdAt: string;
  creatorName: string;
  id: number;
  isRead: boolean;
  publicationId: number;
  receiverId: number;
  type: NotificationType;
  message?: string;
  needId?: number;
  isApprove?: boolean | null;
}

export interface GetNotificationsParams {
  type?: NotificationType;
  size?: number;
  offset?: number;
}

// ---- Send requests (остаются для отправки уведомлений) ----

export interface SendCollaborationRequest {
  message: string;
  publicationId: number;
  receiverId: number;
}

export interface SendNeedResponseRequest {
  message: string;
  needId: number;
  publicationId: number;
  receiverId: number;
}

export interface SendTeamInviteRequest {
  publicationId: number | string;
  receiverId: number;
}

export interface SendTeamInviteResponseRequest {
  isApprove: boolean;
  notificationId: number;
}

export interface TeamInviteNotification extends Omit<Notification, 'type'> {
  isApprove: boolean | null;
  type: 'TeamInvite';
}
