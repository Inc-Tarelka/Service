import { API_URL } from 'shared/api/api_url';
import axios from 'axios';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  GetCategoryNotificationsParams,
  GetNotificationsParams,
  Notification,
  SendCollaborationRequest,
  SendNeedResponseRequest,
  SendTeamInviteRequest,
  SendTeamInviteResponseRequest,
  TeamInviteNotification,
} from './types';

interface TeamInviteResponseAlternativeRequest {
  is_approve: boolean;
  notification_id: number;
}

const isMissingIsApproveValidationError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const responseMessage =
    typeof error.response?.data === 'object' &&
    error.response?.data !== null &&
    'message' in error.response.data
      ? String((error.response.data as { message?: unknown }).message ?? '')
      : '';

  return (
    responseMessage.includes('TeamInviteResponseRequest.IsApprove') &&
    responseMessage.includes('required')
  );
};

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

// =========== GET COLLABORATION NOTIFICATIONS ===========
export const getCollaborationNotifications = async (
  params?: GetCategoryNotificationsParams,
): Promise<Notification[]> => {
  const response = await baseInstanceV1.get<Notification[]>(
    '/notifications/collaboration',
    { params },
  );
  return response.data;
};

// =========== GET NEED RESPONSE NOTIFICATIONS ===========
export const getNeedResponseNotifications = async (
  params?: GetCategoryNotificationsParams,
): Promise<Notification[]> => {
  const response = await baseInstanceV1.get<Notification[]>(
    '/notifications/need-response',
    { params },
  );
  return response.data;
};

// =========== GET TEAM INVITE RESPONSE NOTIFICATIONS ===========
export const getTeamInviteResponseNotifications = async (
  params?: GetCategoryNotificationsParams,
): Promise<Notification[]> => {
  const response = await baseInstanceV1.get<Notification[]>(
    API_URL.notifications_team_invite_response(),
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
    request,
  );
  return response.data;
};

// =========== RESPOND TO TEAM INVITE NOTIFICATION ===========
export const sendTeamInviteResponse = async (
  request: SendTeamInviteResponseRequest,
): Promise<TeamInviteNotification> => {
  try {
    const response = await baseInstanceV1.post<TeamInviteNotification>(
      API_URL.notifications_team_invite_response(),
      request,
    );
    return response.data;
  } catch (error) {
    if (!isMissingIsApproveValidationError(error)) {
      throw error;
    }

    const fallbackPayload: TeamInviteResponseAlternativeRequest = {
      is_approve: request.isApprove,
      notification_id: request.notificationId,
    };

    const fallbackResponse = await baseInstanceV1.post<TeamInviteNotification>(
      API_URL.notifications_team_invite_response(),
      fallbackPayload,
    );

    return fallbackResponse.data;
  }
};

// =========== MARK NOTIFICATION AS READ ===========
export const markNotificationAsRead = async (
  notificationId: number,
): Promise<void> => {
  await baseInstanceV1.post(API_URL.notifications_read(), {
    notification_id: notificationId,
  });
};

// =========== DELETE NOTIFICATION ===========
export const deleteNotification = async (id: number): Promise<void> => {
  await baseInstanceV1.delete(API_URL.notification_by_id(id));
};
