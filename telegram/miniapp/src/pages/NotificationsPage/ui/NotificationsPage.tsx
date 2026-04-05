import { Center, Stack, Text } from '@mantine/core';
import ChatErrorIcon from 'shared/assets/icons/ChatError';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useStore } from 'app/StoreProvider';
import {
  CollaborationDrawer,
  NotificationItem,
  NotificationItemSkeleton,
  NOTIFICATION_CARD_VARIANT,
  NOTIFICATION_TAB,
} from 'entities/notification';
import type { NotificationTab } from 'entities/notification';
import type { Notification } from 'shared/api/service/Notification/types';
import type { TabItem } from 'shared/ui/TabsSwitcher';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import classes from './NotificationsPage.module.scss';

dayjs.locale('ru');

export const NotificationsPage = observer(() => {
  const { notificationsStore } = useStore();

  const [activeTab, setActiveTab] = useState<NotificationTab>(
    NOTIFICATION_TAB.ALL,
  );
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);

  useEffect(() => {
    notificationsStore.fetchIncomingAction();
  }, [notificationsStore]);

  const { incoming, isLoadingIncoming, unreadCount, incomingByType } =
    notificationsStore;

  const collaborationItems = incomingByType('Collaboration');
  const responseItems = incomingByType('Response');
  const teamInviteItems = incomingByType('TeamInvite');
  const noticeItems = incomingByType('Notice');

  const allItems = [...incoming].sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
  );

  const TABS: TabItem<NotificationTab>[] = [
    { label: 'Все', value: NOTIFICATION_TAB.ALL },
    {
      label: 'Сотрудничество',
      value: NOTIFICATION_TAB.COLLABORATION,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { label: 'Отклики', value: NOTIFICATION_TAB.RESPONSES },
    { label: 'Отметки', value: NOTIFICATION_TAB.MENTIONS },
  ];

  const handleNotificationClick = async (item: Notification) => {
    setSelectedNotification(item);
    setDetailOpened(true);
    if (!item.isRead) {
      await notificationsStore.markAsReadAction(item.id);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpened(false);
    setSelectedNotification(null);
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

  const responseGroups = responseItems.reduce<Map<number, Notification[]>>(
    (acc, item) => {
      const key = item.needId ?? 0;
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)!.push(item);
      return acc;
    },
    new Map(),
  );

  return (
    <Page smallPaddingBottom className={classes.page}>
      <TabsSwitcher
        hideMask={true}
        stickyTop={12}
        contentPaddingTop={24}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className={classes.tabs}
        renderTab={(tab) => {
          if (tab === NOTIFICATION_TAB.ALL) {
            if (isLoadingIncoming && allItems.length === 0) {
              return renderSkeletons(4);
            }
            if (allItems.length === 0) {
              return renderEmpty('Пока нет уведомлений');
            }
            return renderList(allItems);
          }

          if (tab === NOTIFICATION_TAB.COLLABORATION) {
            if (isLoadingIncoming && collaborationItems.length === 0) {
              return renderSkeletons();
            }
            if (collaborationItems.length === 0) {
              return renderEmpty('Пока нет уведомлений\nо сотрудничестве');
            }
            return renderList(collaborationItems);
          }

          if (tab === NOTIFICATION_TAB.RESPONSES) {
            if (isLoadingIncoming && responseItems.length === 0) {
              return renderSkeletons();
            }
            if (responseItems.length === 0) {
              return renderEmpty('Пока нет откликов\nна ваши потребности');
            }
            return (
              <Stack gap={24}>
                {Array.from(responseGroups.entries()).map(([needId, items]) => (
                  <Stack key={needId} gap={12}>
                    <Text className={classes.groupTitle}>
                      {`Потребность #${needId}`}
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
            const mentionItems = [...teamInviteItems, ...noticeItems];
            if (isLoadingIncoming && mentionItems.length === 0) {
              return renderSkeletons();
            }
            if (mentionItems.length === 0) {
              return renderEmpty('Пока нет отметок');
            }
            return renderList(mentionItems);
          }

          return null;
        }}
      />

      {selectedNotification?.type === 'Collaboration' && (
        <CollaborationDrawer
          opened={detailOpened}
          onClose={handleCloseDetail}
          sender={{
            name: selectedNotification.creatorName,
            username: selectedNotification.creatorName,
            meta: '',
          }}
          project={{
            title: `Проект #${selectedNotification.publicationId}`,
            description: '',
          }}
          comment={selectedNotification.message ?? ''}
        />
      )}
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
