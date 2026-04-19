import { Center, Loader, Stack, Text } from '@mantine/core';
import ChatErrorIcon from 'shared/assets/icons/ChatError';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from 'app/StoreProvider';
import {
  CollaborationDrawer,
  NotificationItem,
  NotificationItemSkeleton,
  NOTIFICATION_CARD_VARIANT,
  NOTIFICATION_TAB,
  ResponseDrawer,
} from 'entities/notification';
import type { NotificationTab } from 'entities/notification';
import type { Notification } from 'shared/api/service/Notification/types';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import type { TabItem } from 'shared/ui/TabsSwitcher';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import classes from './NotificationsPage.module.scss';

dayjs.locale('ru');

export const NotificationsPage = observer(() => {
  const { notificationsStore } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [activeTab, setActiveTab] = useState<NotificationTab>(
    NOTIFICATION_TAB.ALL,
  );
  const [detailOpened, setDetailOpened] = useState(false);
  const [previewNotification, setPreviewNotification] =
    useState<Notification | null>(null);
  const [openedTabs, setOpenedTabs] = useState<Set<NotificationTab>>(
    new Set([NOTIFICATION_TAB.ALL]),
  );

  useEffect(() => {
    if (pathname !== RoutePath[AppRoutes.NOTIFICATIONS]) {
      return;
    }

    void notificationsStore.initializeNotificationsPageAction();
  }, [notificationsStore, pathname]);

  const {
    allNotifications,
    collaborationNotifications,
    responseNotifications,
    mentionNotifications,
    selectedNotification,
    isLoadingAll,
    isLoadingCollaboration,
    isLoadingResponses,
    isLoadingMentions,
    isLoadingMoreAll,
    isLoadingDetail,
    collaborationUnreadCount,
    responseUnreadCount,
    mentionUnreadCount,
  } = notificationsStore;
  const detailNotification = selectedNotification ?? previewNotification;

  const getTabBadge = (tab: NotificationTab, unreadCount: number) => {
    if (tab === NOTIFICATION_TAB.ALL) {
      return undefined;
    }

    if (openedTabs.has(tab) || unreadCount === 0) {
      return undefined;
    }

    return String(unreadCount);
  };

  const TABS: TabItem<NotificationTab>[] = [
    { label: 'Все', value: NOTIFICATION_TAB.ALL },
    {
      label: 'Сотрудничество',
      value: NOTIFICATION_TAB.COLLABORATION,
      badge: getTabBadge(
        NOTIFICATION_TAB.COLLABORATION,
        collaborationUnreadCount,
      ),
    },
    {
      label: 'Отклики',
      value: NOTIFICATION_TAB.RESPONSES,
      badge: getTabBadge(NOTIFICATION_TAB.RESPONSES, responseUnreadCount),
    },
    {
      label: 'Отметки',
      value: NOTIFICATION_TAB.MENTIONS,
      badge: getTabBadge(NOTIFICATION_TAB.MENTIONS, mentionUnreadCount),
    },
  ];

  const handleNotificationClick = async (item: Notification) => {
    if (item.type === 'TeamInvite') {
      const detailed =
        await notificationsStore.openNotificationDetailAction(item);
      const publicationId = detailed?.publicationId ?? item.publicationId;

      if (publicationId) {
        navigate(
          `${RoutePath[AppRoutes.SERVICE_DETAIL].replace(':id', String(publicationId))}?teamInviteNotificationId=${detailed?.id ?? item.id}`,
        );
      }
      return;
    }

    setPreviewNotification(item);
    setDetailOpened(true);
    void notificationsStore.openNotificationDetailAction(item);
  };

  const handleCloseDetail = () => {
    setDetailOpened(false);
    setPreviewNotification(null);
    notificationsStore.clearSelectedNotificationAction();
  };

  const handleTabChange = (tab: NotificationTab) => {
    setActiveTab(tab);
    setOpenedTabs((prev) => {
      if (prev.has(tab)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  };

  const handleAllTabScrollEnd = (tab: NotificationTab) => {
    if (tab !== NOTIFICATION_TAB.ALL) {
      return;
    }

    notificationsStore.loadMoreAllAction();
  };

  const renderEmpty = (text: string) => (
    <Center className={classes.emptyState}>
      <Stack align="center" gap={12}>
        <ChatErrorIcon size={36} color="var(--accent-color)" />
        <Text className={classes.emptyText}>{text}</Text>
      </Stack>
    </Center>
  );

  const renderSkeletons = (count = 3) => (
    <Stack gap={8}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationItemSkeleton key={i} />
      ))}
    </Stack>
  );

  const renderList = (items: Notification[]) => (
    <Stack gap={8}>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          variant={
            item.message
              ? NOTIFICATION_CARD_VARIANT.WITH_BODY
              : NOTIFICATION_CARD_VARIANT.WITHOUT_BODY
          }
          username={item.creatorName}
          title={getNotificationTitle(item)}
          body={item.message}
          date={dayjs(item.createdAt).format('DD MMM, HH:mm')}
          isRead={item.isRead}
          onClick={() => handleNotificationClick(item)}
        />
      ))}
    </Stack>
  );

  const renderAllTab = () => {
    if (isLoadingAll && allNotifications.length === 0) {
      return renderSkeletons(4);
    }

    if (allNotifications.length === 0) {
      return renderEmpty('Пока нет уведомлений');
    }

    return (
      <Stack gap={8}>
        {allNotifications.map((item) => (
          <NotificationItem
            key={item.id}
            variant={
              item.message
                ? NOTIFICATION_CARD_VARIANT.WITH_BODY
                : NOTIFICATION_CARD_VARIANT.WITHOUT_BODY
            }
            username={item.creatorName}
            title={getNotificationTitle(item)}
            body={item.message}
            date={dayjs(item.createdAt).format('DD MMM, HH:mm')}
            isRead={item.isRead}
            onClick={() => handleNotificationClick(item)}
          />
        ))}
        {isLoadingMoreAll && (
          <Center py={6}>
            <Loader size="sm" color="var(--accent-color)" />
          </Center>
        )}
      </Stack>
    );
  };

  const responseGroups = responseNotifications.reduce<
    Map<number, Notification[]>
  >((acc, item) => {
    const key = item.needId ?? 0;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(item);
    return acc;
  }, new Map());

  return (
    <Page smallPaddingBottom className={classes.page}>
      <TabsSwitcher
        hideMask={true}
        stickyTop={12}
        contentPaddingTop={24}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onTabScrollEnd={handleAllTabScrollEnd}
        className={classes.tabs}
        renderTab={(tab) => {
          if (tab === NOTIFICATION_TAB.ALL) {
            return renderAllTab();
          }

          if (tab === NOTIFICATION_TAB.COLLABORATION) {
            if (
              isLoadingCollaboration &&
              collaborationNotifications.length === 0
            ) {
              return renderSkeletons();
            }
            if (collaborationNotifications.length === 0) {
              return renderEmpty('Пока нет уведомлений\nо сотрудничестве');
            }
            return renderList(collaborationNotifications);
          }

          if (tab === NOTIFICATION_TAB.RESPONSES) {
            if (isLoadingResponses && responseNotifications.length === 0) {
              return renderSkeletons();
            }
            if (responseNotifications.length === 0) {
              return renderEmpty('Пока нет откликов\nна ваши потребности');
            }
            return (
              <Stack gap={24}>
                {Array.from(responseGroups.entries()).map(([needId, items]) => (
                  <Stack key={needId} gap={12}>
                    <Text className={classes.groupTitle}>
                      {items[0]?.needDetails?.title
                        ? `Потребность "${items[0].needDetails.title}"`
                        : `Потребность #${needId}`}
                    </Text>
                    <Stack gap={8}>
                      {items.map((item) => (
                        <NotificationItem
                          key={item.id}
                          variant={NOTIFICATION_CARD_VARIANT.WITH_BODY}
                          username={item.creatorName}
                          title="откликнулся на вашу потребность:"
                          body={item.message}
                          date={dayjs(item.createdAt).format('DD MMM, HH:mm')}
                          isRead={item.isRead}
                          onClick={() => handleNotificationClick(item)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            );
          }

          if (tab === NOTIFICATION_TAB.MENTIONS) {
            if (isLoadingMentions && mentionNotifications.length === 0) {
              return renderSkeletons();
            }
            if (mentionNotifications.length === 0) {
              return renderEmpty('Пока нет отметок');
            }
            return renderList(mentionNotifications);
          }

          return null;
        }}
      />

      <CollaborationDrawer
        opened={detailOpened && detailNotification?.type === 'Collaboration'}
        onClose={handleCloseDetail}
        notification={detailNotification}
        isLoading={isLoadingDetail}
      />

      <ResponseDrawer
        opened={detailOpened && detailNotification?.type === 'Response'}
        onClose={handleCloseDetail}
        notification={detailNotification}
        isLoading={isLoadingDetail}
      />
    </Page>
  );
});

export default NotificationsPage;

function getNotificationTitle(item: Notification): string {
  switch (item.type) {
    case 'Collaboration':
      return 'Запрос на сотрудничество';
    case 'Response':
      return 'Откликнулся на вашу потребность';
    case 'TeamInvite':
      return 'Приглашение в команду';
    case 'Notice':
      return 'Уведомление';
    default:
      return 'Уведомление';
  }
}
