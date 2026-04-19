import { makeAutoObservable } from 'mobx';
import {
  getCollaborationNotifications,
  deleteNotification,
  getIncomingNotifications,
  getNeedResponseNotifications,
  getNotificationById,
  getOutgoingNotifications,
  getTeamInviteResponseNotifications,
  sendCollaborationNotification,
  sendNeedResponseNotification,
  sendTeamInviteResponse,
} from 'shared/api/service/Notification/api';
import { detailsNeedsRequest } from 'shared/api/service/Needs';
import { getPublicationDetails } from 'shared/api/service/Publication';
import { getUserById } from 'shared/api/service/User/api';
import type { User } from 'shared/api/service/User/types';
import type {
  GetCategoryNotificationsParams,
  GetNotificationsParams,
  Notification,
  NotificationType,
  SendCollaborationRequest,
  SendNeedResponseRequest,
} from 'shared/api/service/Notification/types';

const DEFAULT_NOTIFICATIONS_PAGE_SIZE = 20;
const DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT = 20;

interface FetchNotificationsOptions {
  force?: boolean;
}

const getDateTimestamp = (value: string): number => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortByCreatedAtDesc = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort(
    (left, right) =>
      getDateTimestamp(right.createdAt) - getDateTimestamp(left.createdAt),
  );
};

export class NotificationsStore {
  allNotifications: Notification[] = [];
  collaborationNotifications: Notification[] = [];
  responseNotifications: Notification[] = [];
  mentionNotifications: Notification[] = [];
  outgoing: Notification[] = [];

  selectedNotification: Notification | null = null;
  selectedOutgoingNotification: Notification | null = null;

  isLoadingAll = false;
  isLoadingCollaboration = false;
  isLoadingResponses = false;
  isLoadingMentions = false;
  isLoadingMoreAll = false;
  hasMoreAll = true;

  isLoadingOutgoing = false;
  isLoadingDetail = false;
  isLoadingOutgoingDetail = false;
  isSending = false;
  isDeleting = false;
  isRespondingInvite = false;

  private allRequestSeq = 0;
  private collaborationRequestSeq = 0;
  private responseRequestSeq = 0;
  private mentionRequestSeq = 0;
  private allListVersion = 0;
  private allRawOffset = 0;

  constructor() {
    makeAutoObservable(this);
  }

  private buildFallbackCreatorName = (notification: Partial<Notification>) => {
    const firstName = notification.initiator?.firstName ?? '';
    const lastName = notification.initiator?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (notification.initiator?.username) {
      return `@${notification.initiator.username}`;
    }

    if (notification.creatorId) {
      return `Пользователь #${notification.creatorId}`;
    }

    return 'Пользователь';
  };

  private normalizeNotification = (
    notification: Notification,
  ): Notification => {
    const creatorName =
      notification.creatorName?.trim() ||
      this.buildFallbackCreatorName(notification);

    return {
      ...notification,
      creatorName,
      senderId: notification.senderId ?? notification.creatorId,
    };
  };

  private normalizeNotifications = (notifications: Notification[]) => {
    return notifications.map((item) => this.normalizeNotification(item));
  };

  private mergeNotificationLists = (
    current: Notification[],
    incoming: Notification[],
  ): Notification[] => {
    const byId = new Map<number, Notification>();

    current.forEach((item) => {
      byId.set(item.id, item);
    });

    incoming.forEach((item) => {
      const existing = byId.get(item.id);
      if (existing) {
        byId.set(item.id, this.normalizeNotification({ ...existing, ...item }));
        return;
      }

      byId.set(item.id, this.normalizeNotification(item));
    });

    return sortByCreatedAtDesc(Array.from(byId.values()));
  };

  private updateNotificationInList = (
    list: Notification[],
    notification: Notification,
  ): Notification[] => {
    let hasMatch = false;
    const updated = list.map((item) => {
      if (item.id !== notification.id) {
        return item;
      }

      hasMatch = true;
      return this.normalizeNotification({ ...item, ...notification });
    });

    if (!hasMatch) {
      return list;
    }

    return sortByCreatedAtDesc(updated);
  };

  private removeNotificationFromList = (list: Notification[], id: number) => {
    return list.filter((item) => item.id !== id);
  };

  private applyNotificationUpdate = (notification: Notification) => {
    const normalized = this.normalizeNotification(notification);
    this.allNotifications = this.updateNotificationInList(
      this.allNotifications,
      normalized,
    );
    this.collaborationNotifications = this.updateNotificationInList(
      this.collaborationNotifications,
      normalized,
    );
    this.responseNotifications = this.updateNotificationInList(
      this.responseNotifications,
      normalized,
    );
    this.mentionNotifications = this.updateNotificationInList(
      this.mentionNotifications,
      normalized,
    );
    this.outgoing = this.updateNotificationInList(this.outgoing, normalized);
  };

  private findNotificationById = (id: number): Notification | null => {
    const fromAll = this.allNotifications.find((item) => item.id === id);
    if (fromAll) return fromAll;

    const fromCollaboration = this.collaborationNotifications.find(
      (item) => item.id === id,
    );
    if (fromCollaboration) return fromCollaboration;

    const fromResponses = this.responseNotifications.find(
      (item) => item.id === id,
    );
    if (fromResponses) return fromResponses;

    const fromMentions = this.mentionNotifications.find(
      (item) => item.id === id,
    );
    if (fromMentions) return fromMentions;

    const fromOutgoing = this.outgoing.find((item) => item.id === id);
    if (fromOutgoing) return fromOutgoing;

    if (this.selectedNotification?.id === id) {
      return this.selectedNotification;
    }

    return null;
  };

  private mapInitiatorFromUser = (sender: User) => {
    const firstName = sender.person?.name ?? sender.firstName;
    const lastName = sender.person?.surname ?? sender.lastName;
    const profession = sender.specializations?.[0]?.name ?? sender.profession;
    const city = sender.cities?.[0]?.name ?? sender.city;

    return {
      avatarUrl: sender.logo_url ?? sender.avatarUrl,
      city,
      firstName,
      lastName,
      profession,
      telegramUrl: sender.telegram_url,
      username: sender.username,
    };
  };

  private mapCreatorNameFromUser = (sender: User): string => {
    const firstName = sender.person?.name ?? sender.firstName ?? '';
    const lastName = sender.person?.surname ?? sender.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (sender.username) {
      return `@${sender.username}`;
    }

    return 'Пользователь';
  };

  private hasDecision = (notification: Notification): boolean => {
    return (
      notification.isApprove !== null && notification.isApprove !== undefined
    );
  };

  private isVisibleIncomingNotification = (
    notification: Notification,
  ): boolean => {
    if (notification.isDeleted) {
      return false;
    }

    if (
      (notification.type === 'TeamInvite' ||
        notification.type === 'Collaboration') &&
      this.hasDecision(notification)
    ) {
      return false;
    }

    return true;
  };

  private filterVisibleIncoming = (notifications: Notification[]) => {
    return notifications.filter((item) =>
      this.isVisibleIncomingNotification(item),
    );
  };

  initializeNotificationsPageAction = async (): Promise<void> => {
    this.selectedNotification = null;
    this.hasMoreAll = true;
    this.isLoadingMoreAll = false;
    this.allRawOffset = 0;
    this.allNotifications = [];
    this.collaborationNotifications = [];
    this.responseNotifications = [];
    this.mentionNotifications = [];

    await Promise.all([
      this.fetchAllNotificationsAction(
        {
          offset: 0,
          size: DEFAULT_NOTIFICATIONS_PAGE_SIZE,
        },
        { force: true },
      ),
      this.fetchCollaborationNotificationsAction(
        {
          limit: DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
          offset: 0,
        },
        { force: true },
      ),
      this.fetchResponseNotificationsAction(
        {
          limit: DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
          offset: 0,
        },
        { force: true },
      ),
      this.fetchMentionNotificationsAction(
        {
          limit: DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
          offset: 0,
        },
        { force: true },
      ),
    ]);
  };

  fetchAllNotificationsAction = async (
    params?: GetNotificationsParams,
    options?: FetchNotificationsOptions,
  ): Promise<void> => {
    const force = options?.force ?? false;
    if (this.isLoadingAll && !force) return;

    const size = params?.size ?? DEFAULT_NOTIFICATIONS_PAGE_SIZE;
    const requestSeq = ++this.allRequestSeq;

    this.isLoadingAll = true;
    try {
      const data = await getIncomingNotifications({
        ...params,
        offset: params?.offset ?? 0,
        size,
      });
      if (requestSeq !== this.allRequestSeq) {
        return;
      }
      this.allRawOffset = (params?.offset ?? 0) + data.length;
      const normalized = this.normalizeNotifications(data);
      const visible = this.filterVisibleIncoming(normalized);
      this.allNotifications = sortByCreatedAtDesc(visible);
      this.hasMoreAll = data.length >= size;
      this.allListVersion += 1;
    } catch (error) {
      console.error('Failed to fetch incoming notifications:', error);
    } finally {
      if (requestSeq === this.allRequestSeq) {
        this.isLoadingAll = false;
      }
    }
  };

  loadMoreAllAction = async (): Promise<void> => {
    if (this.isLoadingAll || this.isLoadingMoreAll || !this.hasMoreAll) return;

    const listVersion = this.allListVersion;
    this.isLoadingMoreAll = true;
    try {
      const data = await getIncomingNotifications({
        offset: this.allRawOffset,
        size: DEFAULT_NOTIFICATIONS_PAGE_SIZE,
      });
      if (listVersion !== this.allListVersion) {
        return;
      }

      const normalized = this.normalizeNotifications(data);
      const visible = this.filterVisibleIncoming(normalized);
      this.allRawOffset += data.length;

      if (data.length === 0) {
        this.hasMoreAll = false;
        return;
      }

      this.allNotifications = this.mergeNotificationLists(
        this.allNotifications,
        visible,
      );
      this.hasMoreAll = data.length >= DEFAULT_NOTIFICATIONS_PAGE_SIZE;
    } catch (error) {
      console.error('Failed to load more incoming notifications:', error);
    } finally {
      this.isLoadingMoreAll = false;
    }
  };

  fetchCollaborationNotificationsAction = async (
    params?: GetCategoryNotificationsParams,
    options?: FetchNotificationsOptions,
  ): Promise<void> => {
    const force = options?.force ?? false;
    if (this.isLoadingCollaboration && !force) return;

    const requestSeq = ++this.collaborationRequestSeq;
    this.isLoadingCollaboration = true;
    try {
      const data = await getCollaborationNotifications({
        limit: params?.limit ?? DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
        offset: params?.offset ?? 0,
      });
      if (requestSeq !== this.collaborationRequestSeq) {
        return;
      }
      const normalized = this.normalizeNotifications(data);
      const visible = this.filterVisibleIncoming(normalized);
      this.collaborationNotifications = sortByCreatedAtDesc(visible);
    } catch (error) {
      console.error('Failed to fetch collaboration notifications:', error);
    } finally {
      if (requestSeq === this.collaborationRequestSeq) {
        this.isLoadingCollaboration = false;
      }
    }
  };

  fetchResponseNotificationsAction = async (
    params?: GetCategoryNotificationsParams,
    options?: FetchNotificationsOptions,
  ): Promise<void> => {
    const force = options?.force ?? false;
    if (this.isLoadingResponses && !force) return;

    const requestSeq = ++this.responseRequestSeq;
    this.isLoadingResponses = true;
    try {
      const data = await getNeedResponseNotifications({
        limit: params?.limit ?? DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
        offset: params?.offset ?? 0,
      });
      if (requestSeq !== this.responseRequestSeq) {
        return;
      }
      const normalized = this.normalizeNotifications(data);
      this.responseNotifications = sortByCreatedAtDesc(normalized);
    } catch (error) {
      console.error('Failed to fetch need response notifications:', error);
    } finally {
      if (requestSeq === this.responseRequestSeq) {
        this.isLoadingResponses = false;
      }
    }
  };

  fetchMentionNotificationsAction = async (
    params?: GetCategoryNotificationsParams,
    options?: FetchNotificationsOptions,
  ): Promise<void> => {
    const force = options?.force ?? false;
    if (this.isLoadingMentions && !force) return;

    const requestSeq = ++this.mentionRequestSeq;
    this.isLoadingMentions = true;
    try {
      const data = await getTeamInviteResponseNotifications({
        limit: params?.limit ?? DEFAULT_CATEGORY_NOTIFICATIONS_LIMIT,
        offset: params?.offset ?? 0,
      });
      if (requestSeq !== this.mentionRequestSeq) {
        return;
      }
      const normalized = this.normalizeNotifications(data);
      const visible = this.filterVisibleIncoming(normalized);
      this.mentionNotifications = sortByCreatedAtDesc(visible);
    } catch (error) {
      console.error('Failed to fetch team invite notifications:', error);
    } finally {
      if (requestSeq === this.mentionRequestSeq) {
        this.isLoadingMentions = false;
      }
    }
  };

  fetchOutgoingAction = async (params?: GetNotificationsParams) => {
    if (this.isLoadingOutgoing) return;
    this.isLoadingOutgoing = true;
    try {
      const data = await getOutgoingNotifications(params);
      const normalized = this.normalizeNotifications(data);
      this.outgoing = sortByCreatedAtDesc(normalized);
    } catch (error) {
      console.error('Failed to fetch outgoing notifications:', error);
    } finally {
      this.isLoadingOutgoing = false;
    }
  };

  openOutgoingNotificationDetailAction = async (
    notification: Notification,
  ): Promise<Notification | null> => {
    if (this.isLoadingOutgoingDetail) return this.selectedOutgoingNotification;

    this.isLoadingOutgoingDetail = true;
    this.selectedOutgoingNotification =
      this.normalizeNotification(notification);

    try {
      const detailedNotification = await getNotificationById(notification.id);

      const mergedBase = this.normalizeNotification({
        ...notification,
        ...detailedNotification,
        creatorId: detailedNotification.creatorId ?? notification.creatorId,
        creatorName:
          detailedNotification.creatorName ?? notification.creatorName,
      });

      let enriched = mergedBase;
      let linkedPublicationId = mergedBase.publicationId;

      if (mergedBase.needId) {
        try {
          const needDetails = await detailsNeedsRequest(
            String(mergedBase.needId),
          );
          enriched = {
            ...enriched,
            needDetails: {
              description: needDetails.description,
              title: needDetails.name,
            },
          };

          if (!linkedPublicationId && needDetails.publicationId) {
            linkedPublicationId = needDetails.publicationId;
          }
        } catch (error) {
          console.error(
            'Failed to fetch outgoing notification need details:',
            error,
          );
        }
      }

      if (linkedPublicationId) {
        try {
          const publicationDetails =
            await getPublicationDetails(linkedPublicationId);
          const publication = publicationDetails.publication;
          const publicationCard = {
            description: publication.description ?? '',
            imageUrl: publication.topImageUrl ?? publication.images?.[0]?.url,
            title: publication.name,
          };

          enriched = {
            ...enriched,
            projectDetails: publicationCard,
            publicationId: linkedPublicationId,
            serviceDetails: publicationCard,
          };
        } catch (error) {
          console.error(
            'Failed to fetch outgoing notification linked publication details:',
            error,
          );
        }
      }

      if (mergedBase.receiverId) {
        try {
          const receiverResponse = await getUserById(
            String(mergedBase.receiverId),
          );
          const receiver = receiverResponse.data;
          const receiverInitiator = this.mapInitiatorFromUser(receiver);
          const receiverCreatorName = this.mapCreatorNameFromUser(receiver);

          enriched = {
            ...enriched,
            creatorName: enriched.creatorName ?? receiverCreatorName,
            initiator: {
              ...receiverInitiator,
              ...enriched.initiator,
            },
            senderId: Number(receiver.id),
          };
        } catch (error) {
          console.error(
            'Failed to fetch outgoing notification receiver details:',
            error,
          );
        }
      }

      const normalizedEnriched = this.normalizeNotification(enriched);
      this.outgoing = this.mergeNotificationLists(this.outgoing, [
        normalizedEnriched,
      ]);
      this.selectedOutgoingNotification = normalizedEnriched;
      return normalizedEnriched;
    } catch (error) {
      console.error('Failed to open outgoing notification details:', error);
      return this.selectedOutgoingNotification;
    } finally {
      this.isLoadingOutgoingDetail = false;
    }
  };

  openNotificationDetailAction = async (
    notification: Notification,
  ): Promise<Notification | null> => {
    if (this.isLoadingDetail) return this.selectedNotification;

    this.isLoadingDetail = true;
    this.selectedNotification = this.normalizeNotification(notification);

    try {
      const detailedNotification = await getNotificationById(notification.id);

      const mergedBase = this.normalizeNotification({
        ...notification,
        ...detailedNotification,
        creatorId: detailedNotification.creatorId ?? notification.creatorId,
        creatorName:
          detailedNotification.creatorName ?? notification.creatorName,
      });

      let enriched = mergedBase;
      let linkedPublicationId = mergedBase.publicationId;

      if (mergedBase.needId) {
        try {
          const needDetails = await detailsNeedsRequest(
            String(mergedBase.needId),
          );
          enriched = {
            ...enriched,
            needDetails: {
              description: needDetails.description,
              title: needDetails.name,
            },
          };

          if (!linkedPublicationId && needDetails.publicationId) {
            linkedPublicationId = needDetails.publicationId;
          }
        } catch (error) {
          console.error('Failed to fetch notification need details:', error);
        }
      }

      if (linkedPublicationId) {
        try {
          const publicationDetails =
            await getPublicationDetails(linkedPublicationId);
          const publication = publicationDetails.publication;
          const publicationCard = {
            description: publication.description ?? '',
            imageUrl: publication.topImageUrl ?? publication.images?.[0]?.url,
            title: publication.name,
          };

          enriched = {
            ...enriched,
            projectDetails: publicationCard,
            publicationId: linkedPublicationId,
            serviceDetails: publicationCard,
          };
        } catch (error) {
          console.error(
            'Failed to fetch notification linked publication details:',
            error,
          );
        }
      }

      const senderId = enriched.creatorId ?? notification.creatorId;
      if (senderId) {
        try {
          const senderResponse = await getUserById(String(senderId));
          const sender = senderResponse.data;
          const senderCreatorName = this.mapCreatorNameFromUser(sender);

          enriched = {
            ...enriched,
            creatorName: enriched.creatorName ?? senderCreatorName,
            initiator: this.mapInitiatorFromUser(sender),
            senderId: Number(sender.id),
          };
        } catch (error) {
          console.error('Failed to fetch notification sender details:', error);
        }
      }

      const normalizedEnriched = this.normalizeNotification(enriched);
      this.applyNotificationUpdate(normalizedEnriched);
      this.selectedNotification = normalizedEnriched;
      return normalizedEnriched;
    } catch (error) {
      console.error('Failed to open notification details:', error);
      return this.selectedNotification;
    } finally {
      this.isLoadingDetail = false;
    }
  };

  markAsReadAction = async (id: number): Promise<Notification | null> => {
    try {
      const existing = this.findNotificationById(id);
      const updated = await getNotificationById(id);
      const normalized = this.normalizeNotification({
        ...existing,
        ...updated,
        creatorId: updated.creatorId ?? existing?.creatorId,
        creatorName: updated.creatorName ?? existing?.creatorName,
      });

      this.applyNotificationUpdate(normalized);

      if (this.selectedNotification?.id === id) {
        this.selectedNotification = normalized;
      }

      return normalized;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return null;
    }
  };

  respondTeamInviteAction = async (
    notificationId: number,
    isApprove: boolean,
  ): Promise<boolean> => {
    if (this.isRespondingInvite) return false;

    this.isRespondingInvite = true;
    try {
      const existing = this.findNotificationById(notificationId);
      const updated = await sendTeamInviteResponse({
        isApprove,
        notificationId,
      });

      const normalized = this.normalizeNotification({
        ...existing,
        ...updated,
        creatorId: updated.creatorId ?? existing?.creatorId,
        creatorName: updated.creatorName ?? existing?.creatorName,
        type: 'TeamInvite',
      });

      this.applyNotificationUpdate(normalized);
      this.allNotifications = this.removeNotificationFromList(
        this.allNotifications,
        notificationId,
      );
      this.mentionNotifications = this.removeNotificationFromList(
        this.mentionNotifications,
        notificationId,
      );

      if (this.selectedNotification?.id === notificationId) {
        this.selectedNotification = normalized;
      }

      return true;
    } catch (error) {
      console.error('Failed to respond team invite notification:', error);
      return false;
    } finally {
      this.isRespondingInvite = false;
    }
  };

  acceptTeamInviteAction = async (notificationId: number): Promise<boolean> => {
    return this.respondTeamInviteAction(notificationId, true);
  };

  deleteNotificationAction = async (id: number): Promise<boolean> => {
    if (this.isDeleting) return false;
    this.isDeleting = true;
    try {
      await deleteNotification(id);
      this.allNotifications = this.removeNotificationFromList(
        this.allNotifications,
        id,
      );
      this.collaborationNotifications = this.removeNotificationFromList(
        this.collaborationNotifications,
        id,
      );
      this.responseNotifications = this.removeNotificationFromList(
        this.responseNotifications,
        id,
      );
      this.mentionNotifications = this.removeNotificationFromList(
        this.mentionNotifications,
        id,
      );
      this.outgoing = this.removeNotificationFromList(this.outgoing, id);

      if (this.selectedNotification?.id === id) {
        this.selectedNotification = null;
      }
      if (this.selectedOutgoingNotification?.id === id) {
        this.selectedOutgoingNotification = null;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    } finally {
      this.isDeleting = false;
    }
  };

  sendCollaborationAction = async (
    request: SendCollaborationRequest,
  ): Promise<boolean> => {
    this.isSending = true;
    try {
      const created = this.normalizeNotification(
        await sendCollaborationNotification(request),
      );
      this.outgoing = this.mergeNotificationLists(this.outgoing, [created]);
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
      const created = this.normalizeNotification(
        await sendNeedResponseNotification(request),
      );
      this.outgoing = this.mergeNotificationLists(this.outgoing, [created]);
      return true;
    } catch (error) {
      console.error('Failed to send need response notification:', error);
      return false;
    } finally {
      this.isSending = false;
    }
  };

  clearSelectedNotificationAction = (): void => {
    this.selectedNotification = null;
  };

  clearSelectedOutgoingNotificationAction = (): void => {
    this.selectedOutgoingNotification = null;
  };

  get incoming(): Notification[] {
    return this.allNotifications;
  }

  get isLoadingIncoming(): boolean {
    return this.isLoadingAll;
  }

  get unreadCount(): number {
    return this.allNotifications.filter((item) => item.isRead === false).length;
  }

  get incomingByType(): (type: NotificationType) => Notification[] {
    return (type) =>
      this.allNotifications.filter(
        (notification) => notification.type === type,
      );
  }

  get collaborationUnreadCount(): number {
    return this.collaborationNotifications.filter(
      (item) => item.isRead === false,
    ).length;
  }

  get responseUnreadCount(): number {
    return this.responseNotifications.filter((item) => item.isRead === false)
      .length;
  }

  get mentionUnreadCount(): number {
    return this.mentionNotifications.filter((item) => item.isRead === false)
      .length;
  }

  reset = (): void => {
    this.allNotifications = [];
    this.collaborationNotifications = [];
    this.responseNotifications = [];
    this.mentionNotifications = [];
    this.outgoing = [];

    this.selectedNotification = null;
    this.selectedOutgoingNotification = null;

    this.isLoadingAll = false;
    this.isLoadingCollaboration = false;
    this.isLoadingResponses = false;
    this.isLoadingMentions = false;
    this.isLoadingMoreAll = false;
    this.hasMoreAll = true;
    this.isLoadingOutgoing = false;
    this.isLoadingDetail = false;
    this.isLoadingOutgoingDetail = false;
    this.isSending = false;
    this.isDeleting = false;
    this.isRespondingInvite = false;

    this.allRequestSeq = 0;
    this.collaborationRequestSeq = 0;
    this.responseRequestSeq = 0;
    this.mentionRequestSeq = 0;
    this.allListVersion = 0;
    this.allRawOffset = 0;
  };
}
