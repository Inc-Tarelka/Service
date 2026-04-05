import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  GetNotificationsParams,
  Notification,
  SendCollaborationRequest,
  SendNeedResponseRequest,
  SendTeamInviteRequest,
  SendTeamInviteResponseRequest,
  TeamInviteNotification,
} from './types';

// =========== GET INCOMING NOTIFICATIONS ===========
export const getIncomingNotifications = async (
  params?: GetNotificationsParams,
): Promise<Notification[]> => {
  const response = await baseInstanceV1.get<Notification[]>(
    API_URL.notifications_incoming(),
    { params },
  );
  return response.data;
};

// =========== GET OUTGOING NOTIFICATIONS ===========
export const getOutgoingNotifications = async (
  params?: GetNotificationsParams,
): Promise<Notification[]> => {
  const response = await baseInstanceV1.get<Notification[]>(
    API_URL.notifications_outgoing(),
    { params },
  );
  return response.data;
};

// =========== GET NOTIFICATION BY ID (marks as read) ===========
export const getNotificationById = async (
  id: number,
): Promise<Notification> => {
  const response = await baseInstanceV1.get<Notification>(
    API_URL.notification_by_id(id),
  );
  return response.data;
};

// =========== SEND COLLABORATION NOTIFICATION ===========
export const sendCollaborationNotification = async (
  request: SendCollaborationRequest,
): Promise<Notification> => {
  const response = await baseInstanceV1.post<Notification>(
    '/notifications/collaboration',
    request,
  );
  return response.data;
};

// =========== SEND NEED RESPONSE NOTIFICATION ===========
export const sendNeedResponseNotification = async (
  request: SendNeedResponseRequest,
): Promise<Notification> => {
  const response = await baseInstanceV1.post<Notification>(
    '/notifications/need-response',
    request,
  );
  return response.data;
};

// =========== SEND TEAM INVITE NOTIFICATION ===========
export const sendTeamInviteNotification = async (
  request: SendTeamInviteRequest,
): Promise<TeamInviteNotification> => {
  const response = await baseInstanceV1.post<TeamInviteNotification>(
    API_URL.notifications_team_invite(),
    {
      publicationId: request.publicationId,
      publicationID: request.publicationId,
      publication_id: request.publicationId,
      receiverId: request.receiverId,
      receiverID: request.receiverId,
      receiver_id: request.receiverId,
      PublicationID: request.publicationId,
      ReceiverID: request.receiverId,
    },
  );
  return response.data;
};

// =========== RESPOND TO TEAM INVITE NOTIFICATION ===========
export const sendTeamInviteResponse = async (
  request: SendTeamInviteResponseRequest,
): Promise<TeamInviteNotification> => {
  const response = await baseInstanceV1.post<TeamInviteNotification>(
    API_URL.notifications_team_invite_response(),
    {
      notificationId: request.notificationId,
      notificationID: request.notificationId,
      notification_id: request.notificationId,
      isApprove: request.isApprove,
      is_approve: request.isApprove,
      NotificationID: request.notificationId,
      IsApprove: request.isApprove,
    },
  );
  return response.data;
};
