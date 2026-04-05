import { makeAutoObservable } from 'mobx';
import {
  sendTeamInviteNotification,
  sendTeamInviteResponse,
} from 'shared/api/service/Notification';
import type {
  SendTeamInviteRequest,
  SendTeamInviteResponseRequest,
  TeamInviteNotification,
} from 'shared/api/service/Notification';

interface SendTeamInvitesResult {
  failedReceiverIds: number[];
  successfulReceiverIds: number[];
}

const isValidPublicationId = (publicationId: string | number): boolean => {
  if (typeof publicationId === 'number') {
    return Number.isFinite(publicationId);
  }

  return publicationId.trim().length > 0;
};

export class NotificationTeamInviteStore {
  isResponding = false;
  isSending = false;
  notifications: TeamInviteNotification[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  sendTeamInviteAction = async (
    request: SendTeamInviteRequest,
  ): Promise<TeamInviteNotification | null> => {
    this.isSending = true;

    try {
      const created = await sendTeamInviteNotification(request);
      this.notifications = [created, ...this.notifications];
      return created;
    } catch (error) {
      console.error('Failed to send team invite notification:', error);
      return null;
    } finally {
      this.isSending = false;
    }
  };

  sendTeamInvitesAction = async (
    publicationId: number | string,
    receiverIds: number[],
  ): Promise<SendTeamInvitesResult> => {
    if (!isValidPublicationId(publicationId)) {
      console.error('Invalid publicationId for team invites:', publicationId);
      return {
        failedReceiverIds: [...receiverIds],
        successfulReceiverIds: [],
      };
    }

    if (receiverIds.length === 0) {
      return {
        failedReceiverIds: [],
        successfulReceiverIds: [],
      };
    }

    this.isSending = true;

    try {
      const normalizedPublicationId =
        typeof publicationId === 'string'
          ? publicationId.trim()
          : publicationId;

      const results = await Promise.all(
        receiverIds.map(async (receiverId) => {
          try {
            const created = await sendTeamInviteNotification({
              publicationId: normalizedPublicationId,
              receiverId,
            });

            return {
              created,
              receiverId,
              success: true as const,
            };
          } catch (error) {
            console.error(
              `Failed to send team invite notification to user ${receiverId}:`,
              error,
            );

            return {
              receiverId,
              success: false as const,
            };
          }
        }),
      );

      const successfulInvites = results.filter((result) => result.success);
      const failedInvites = results.filter((result) => !result.success);

      if (successfulInvites.length > 0) {
        this.notifications = [
          ...successfulInvites.map((result) => result.created),
          ...this.notifications,
        ];
      }

      return {
        failedReceiverIds: failedInvites.map((result) => result.receiverId),
        successfulReceiverIds: successfulInvites.map(
          (result) => result.receiverId,
        ),
      };
    } finally {
      this.isSending = false;
    }
  };

  respondToTeamInviteAction = async (
    request: SendTeamInviteResponseRequest,
  ): Promise<TeamInviteNotification | null> => {
    this.isResponding = true;

    try {
      const updated = await sendTeamInviteResponse(request);
      this.notifications = this.notifications.map((notification) =>
        notification.id === updated.id ? updated : notification,
      );
      return updated;
    } catch (error) {
      console.error('Failed to respond to team invite notification:', error);
      return null;
    } finally {
      this.isResponding = false;
    }
  };

  reset = (): void => {
    this.isResponding = false;
    this.isSending = false;
    this.notifications = [];
  };
}
