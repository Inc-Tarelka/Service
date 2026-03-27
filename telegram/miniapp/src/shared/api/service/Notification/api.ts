import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  CollaborationNotification,
  GetCollaborationNotificationsParams,
  SendCollaborationRequest,
} from './types';

// =========== GET COLLABORATION NOTIFICATIONS ===========
export const getCollaborationNotifications = async (
  params?: GetCollaborationNotificationsParams,
): Promise<CollaborationNotification[]> => {
  const response = await baseInstanceV1.get<CollaborationNotification[]>(
    API_URL.notifications_collaboration(),
    { params },
  );
  return response.data;
};

// =========== SEND COLLABORATION NOTIFICATION ===========
export const sendCollaborationNotification = async (
  request: SendCollaborationRequest,
): Promise<CollaborationNotification> => {
  const response = await baseInstanceV1.post<CollaborationNotification>(
    API_URL.notifications_collaboration(),
    request,
  );
  return response.data;
};
