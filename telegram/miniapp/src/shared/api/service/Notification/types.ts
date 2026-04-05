export interface CollaborationNotification {
  createdAt: string;
  creatorId: number;
  id: number;
  isRead: boolean;
  message: string;
  needId: number;
  publicationId: number;
  receiverId: number;
  type: 'Collaboration';
}

export interface GetCollaborationNotificationsParams {
  limit?: number;
  offset?: number;
}

export interface SendCollaborationRequest {
  message: string;
  publicationId: number;
  receiverId: number;
}

export interface NeedResponseNotification {
  createdAt: string;
  creatorId: number;
  id: number;
  isRead: boolean;
  message: string;
  needId: number;
  publicationId: number;
  receiverId: number;
  type: 'Collaboration';
}

export interface GetNeedResponseNotificationsParams {
  limit?: number;
  offset?: number;
}

export interface SendNeedResponseRequest {
  message: string;
  needId: number;
  publicationId: number;
  receiverId: number;
}
