import { Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CollaborationDrawer,
  NotificationItem,
  NOTIFICATION_TAB,
  ResponseDrawer,
} from 'entities/notification';
import type { NotificationTab } from 'entities/notification';
import {
  MOCK_NOTIFICATION_GROUPS,
  MOCK_NOTIFICATIONS,
} from 'shared/mocks/notificationsMocks';
import type { NotificationMock } from 'shared/mocks/notificationsMocks';
import type { TabItem } from 'shared/ui/TabsSwitcher';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import classes from './NotificationsPage.module.scss';

const TABS: TabItem<NotificationTab>[] = [
  { label: 'Все', value: NOTIFICATION_TAB.ALL },
  {
    label: 'Сотрудничество',
    value: NOTIFICATION_TAB.COLLABORATION,
    badge: '9+',
  },
  { label: 'Отклики', value: NOTIFICATION_TAB.RESPONSES },
  { label: 'Отметки', value: NOTIFICATION_TAB.MENTIONS },
];

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationTab>(
    NOTIFICATION_TAB.ALL,
  );
  const [selectedItem, setSelectedItem] = useState<NotificationMock | null>(
    null,
  );
  const [responseOpened, { open: openResponse, close: closeResponse }] =
    useDisclosure(false);
  const [
    collaborationOpened,
    { open: openCollaboration, close: closeCollaboration },
  ] = useDisclosure(false);

  const handleItemClick = (item: NotificationMock) => {
    if (item.tab === 'mentions') {
      navigate(`/service/${item.linkedServiceId ?? '1'}`);
      return;
    }
    setSelectedItem(item);
    if (item.tab === 'responses') {
      openResponse();
    } else if (item.tab === 'collaboration') {
      openCollaboration();
    }
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
                          onClick={() => handleItemClick(item)}
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
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </Stack>
          );
        }}
      />

      {selectedItem?.tab === 'responses' &&
        selectedItem.sender &&
        selectedItem.need &&
        selectedItem.linkedItem &&
        selectedItem.comment && (
          <ResponseDrawer
            opened={responseOpened}
            onClose={closeResponse}
            sender={selectedItem.sender}
            need={selectedItem.need}
            service={selectedItem.linkedItem}
            comment={selectedItem.comment}
          />
        )}

      {selectedItem?.tab === 'collaboration' &&
        selectedItem.sender &&
        selectedItem.linkedItem &&
        selectedItem.comment && (
          <CollaborationDrawer
            opened={collaborationOpened}
            onClose={closeCollaboration}
            sender={selectedItem.sender}
            project={selectedItem.linkedItem}
            comment={selectedItem.comment}
          />
        )}
    </Page>
  );
};

export default NotificationsPage;
