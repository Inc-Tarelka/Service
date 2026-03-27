import { Center, Stack, Text } from '@mantine/core';
import ChatErrorIcon from 'shared/assets/icons/ChatError';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'app/StoreProvider';
import {
  CollaborationDrawer,
  NotificationItem,
  NOTIFICATION_CARD_VARIANT,
  NOTIFICATION_TAB,
  ResponseDrawer,
} from 'entities/notification';
import type { NotificationTab } from 'entities/notification';
import type { CollaborationNotification } from 'shared/api/service/Notification/types';
import {
  MOCK_NOTIFICATION_GROUPS,
  MOCK_NOTIFICATIONS,
} from 'shared/mocks/notificationsMocks';
import type { NotificationMock } from 'shared/mocks/notificationsMocks';
import type { TabItem } from 'shared/ui/TabsSwitcher';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import classes from './NotificationsPage.module.scss';

dayjs.locale('ru');

export const NotificationsPage = observer(() => {
  const navigate = useNavigate();
  const { notificationCollaborationStore } = useStore();

  const [activeTab, setActiveTab] = useState<NotificationTab>(
    NOTIFICATION_TAB.ALL,
  );
  const [selectedMock, setSelectedMock] = useState<NotificationMock | null>(
    null,
  );
  const [selectedCollaboration, setSelectedCollaboration] =
    useState<CollaborationNotification | null>(null);

  const [responseOpened, { open: openResponse, close: closeResponse }] =
    useDisclosure(false);
  const [
    collaborationOpened,
    { open: openCollaboration, close: closeCollaboration },
  ] = useDisclosure(false);

  useEffect(() => {
    notificationCollaborationStore.fetchNotificationsAction();
  }, [notificationCollaborationStore]);

  const {
    unreadCount,
    notifications: collaborationNotifications,
    isLoading: isCollaborationLoading,
  } = notificationCollaborationStore;

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

  const handleMockItemClick = (item: NotificationMock) => {
    if (item.tab === 'mentions') {
      navigate(`/service/${item.linkedServiceId ?? '89'}`);
      return;
    }
    setSelectedMock(item);
    if (item.tab === 'responses') {
      openResponse();
    } else if (item.tab === 'collaboration') {
      openCollaboration();
    }
  };

  const handleCollaborationClick = (item: CollaborationNotification) => {
    setSelectedCollaboration(item);
    openCollaboration();
  };

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
          if (tab === NOTIFICATION_TAB.COLLABORATION) {
            if (
              isCollaborationLoading &&
              collaborationNotifications.length === 0
            ) {
              return null;
            }
            if (collaborationNotifications.length === 0) {
              return (
                <Center className={classes.emptyState}>
                  <Stack align="center" gap={12}>
                    <ChatErrorIcon size={36} color="var(--accent-color)" />
                    <Text className={classes.emptyText}>
                      {'Пока нет уведомлений\nо сотрудничестве'}
                    </Text>
                  </Stack>
                </Center>
              );
            }
            return (
              <Stack gap={8}>
                {collaborationNotifications.map((item) => (
                  <NotificationItem
                    key={item.id}
                    variant={NOTIFICATION_CARD_VARIANT.WITH_BODY}
                    title="Запрос на сотрудничество"
                    body={item.message}
                    date={dayjs(item.createdAt).format('DD MMM, HH:mm')}
                    isRead={item.isRead}
                    onClick={() => handleCollaborationClick(item)}
                  />
                ))}
              </Stack>
            );
          }

          const items = MOCK_NOTIFICATIONS.filter(
            (item) => tab === NOTIFICATION_TAB.ALL || item.tab === tab,
          );
          const grouped = tab === NOTIFICATION_TAB.RESPONSES;

          if (grouped) {
            return (
              <Stack gap={24}>
                {MOCK_NOTIFICATION_GROUPS.map((group) => (
                  <Stack key={group.id} gap={12}>
                    <Text
                      className={
                        group.isHighlighted
                          ? classes.groupTitleHighlighted
                          : classes.groupTitle
                      }
                    >
                      {group.title}
                    </Text>
                    <Stack gap={8}>
                      {group.items.map((item) => (
                        <NotificationItem
                          key={item.id}
                          variant={item.variant}
                          username={item.username}
                          title={item.title}
                          body={item.body}
                          date={item.date}
                          isRead={item.isRead}
                          onClick={() => handleMockItemClick(item)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            );
          }

          return (
            <Stack gap={8}>
              {items.map((item) => (
                <NotificationItem
                  key={item.id}
                  variant={item.variant}
                  username={item.username}
                  title={item.title}
                  body={item.body}
                  date={item.date}
                  isRead={item.isRead}
                  onClick={() => handleMockItemClick(item)}
                />
              ))}
            </Stack>
          );
        }}
      />

      {selectedMock?.tab === 'responses' &&
        selectedMock.sender &&
        selectedMock.need &&
        selectedMock.linkedItem &&
        selectedMock.comment && (
          <ResponseDrawer
            opened={responseOpened}
            onClose={closeResponse}
            sender={selectedMock.sender}
            need={selectedMock.need}
            service={selectedMock.linkedItem}
            comment={selectedMock.comment}
          />
        )}

      {selectedCollaboration && (
        <CollaborationDrawer
          opened={collaborationOpened}
          onClose={closeCollaboration}
          sender={{
            name: `Пользователь ${selectedCollaboration.creatorId}`,
            username: String(selectedCollaboration.creatorId),
            meta: '',
          }}
          project={{
            title: `Проект #${selectedCollaboration.publicationId}`,
            description: '',
          }}
          comment={selectedCollaboration.message}
        />
      )}
    </Page>
  );
});

export default NotificationsPage;
