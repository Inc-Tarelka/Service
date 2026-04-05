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
  NotificationItemSkeleton,
  NOTIFICATION_CARD_VARIANT,
  NOTIFICATION_TAB,
  ResponseDrawer,
} from 'entities/notification';
import type { NotificationTab } from 'entities/notification';
import type {
  CollaborationNotification,
  NeedResponseNotification,
} from 'shared/api/service/Notification/types';
import { MOCK_NOTIFICATIONS } from 'shared/mocks/notificationsMocks';
import type { NotificationMock } from 'shared/mocks/notificationsMocks';
import type { TabItem } from 'shared/ui/TabsSwitcher';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import classes from './NotificationsPage.module.scss';

dayjs.locale('ru');

export const NotificationsPage = observer(() => {
  const navigate = useNavigate();
  const { notificationCollaborationStore, notificationNeedResponseStore } =
    useStore();

  const [activeTab, setActiveTab] = useState<NotificationTab>(
    NOTIFICATION_TAB.ALL,
  );
  const [selectedMock, setSelectedMock] = useState<NotificationMock | null>(
    null,
  );
  const [selectedCollaboration, setSelectedCollaboration] =
    useState<CollaborationNotification | null>(null);
  const [selectedResponse, setSelectedResponse] =
    useState<NeedResponseNotification | null>(null);

  const [responseOpened, { open: openResponse, close: closeResponse }] =
    useDisclosure(false);
  const [
    collaborationOpened,
    { open: openCollaboration, close: closeCollaboration },
  ] = useDisclosure(false);

  useEffect(() => {
    notificationCollaborationStore.fetchNotificationsAction();
    notificationNeedResponseStore.fetchNotificationsAction();
  }, [notificationCollaborationStore, notificationNeedResponseStore]);

  const {
    unreadCount,
    notifications: collaborationNotifications,
    isLoading: isCollaborationLoading,
  } = notificationCollaborationStore;

  const { notifications: responseNotifications, isLoading: isResponseLoading } =
    notificationNeedResponseStore;

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
    setSelectedResponse(null);
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

  const handleResponseClick = (item: NeedResponseNotification) => {
    setSelectedMock(null);
    setSelectedResponse(item);
    openResponse();
  };

  const responseGroups = responseNotifications.reduce<
    Map<number, NeedResponseNotification[]>
  >((acc, item) => {
    const key = item.needId;
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
        onTabChange={setActiveTab}
        className={classes.tabs}
        renderTab={(tab) => {
          if (tab === NOTIFICATION_TAB.COLLABORATION) {
            if (
              isCollaborationLoading &&
              collaborationNotifications.length === 0
            ) {
              return (
                <Stack gap={8}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <NotificationItemSkeleton key={i} />
                  ))}
                </Stack>
              );
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

          if (tab === NOTIFICATION_TAB.RESPONSES) {
            if (isResponseLoading && responseNotifications.length === 0) {
              return (
                <Stack gap={24}>
                  {Array.from({ length: 2 }).map((_, gi) => (
                    <Stack key={gi} gap={12}>
                      <NotificationItemSkeleton />
                      <Stack gap={8}>
                        {Array.from({ length: 2 }).map((__, i) => (
                          <NotificationItemSkeleton key={i} />
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              );
            }

            if (responseNotifications.length === 0) {
              return (
                <Center className={classes.emptyState}>
                  <Stack align="center" gap={12}>
                    <ChatErrorIcon size={36} color="var(--accent-color)" />
                    <Text className={classes.emptyText}>
                      {'Пока нет откликов\nна ваши потребности'}
                    </Text>
                  </Stack>
                </Center>
              );
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
                          title="откликнулся на вашу потребность:"
                          body={item.message}
                          date={dayjs(item.createdAt).format('DD MMM, HH:mm')}
                          isRead={item.isRead}
                          onClick={() => handleResponseClick(item)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            );
          }

          const items = MOCK_NOTIFICATIONS.filter(
            (item) => tab === NOTIFICATION_TAB.ALL || item.tab === tab,
          );

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

      {selectedResponse && !selectedMock && (
        <ResponseDrawer
          opened={responseOpened}
          onClose={() => {
            closeResponse();
            setSelectedResponse(null);
          }}
          sender={{
            name: `Пользователь ${selectedResponse.creatorId}`,
            username: String(selectedResponse.creatorId),
            meta: '',
          }}
          need={{
            title: `Потребность #${selectedResponse.needId}`,
            description: '',
          }}
          service={{
            title: `Публикация #${selectedResponse.publicationId}`,
            description: '',
          }}
          comment={selectedResponse.message}
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
