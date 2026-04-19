export type NotificationType =
  | 'Collaboration'
  | 'Response'
  | 'Notice'
  | 'TeamInvite';

export interface NotificationInitiator {
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profession?: string;
  city?: string;
  telegramUrl?: string;
}

export interface NotificationNeedDetails {
  title: string;
  description: string;
}

export interface NotificationServiceDetails {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface NotificationProjectDetails {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Notification {
  createdAt: string;
  id: number;
  isRead: boolean;
  publicationId: number;
  receiverId: number;
  type: NotificationType;
  creatorId?: number;
  creatorName?: string;
  isDeleted?: boolean;
  message?: string;
  needId?: number;
  isApprove?: boolean | null;
  senderId?: number;
  initiator?: NotificationInitiator;
  needDetails?: NotificationNeedDetails;
  serviceDetails?: NotificationServiceDetails;
  projectDetails?: NotificationProjectDetails;
}

export interface GetNotificationsParams {
  type?: NotificationType;
  size?: number;
  offset?: number;
}

export interface GetCategoryNotificationsParams {
  limit?: number;
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
  type: 'TeamInvite';
  isApprove: boolean | null;
}
