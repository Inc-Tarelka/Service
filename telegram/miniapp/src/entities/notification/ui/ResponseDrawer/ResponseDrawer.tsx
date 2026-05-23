import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { XIcon } from 'shared/assets/icons/x';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import { useNavigate } from 'react-router-dom';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import type { Notification } from 'shared/api/service/Notification/types';
import { openSenderTelegram } from '../../lib/openSenderTelegram';
import classes from './ResponseDrawer.module.scss';

interface ResponseDrawerProps {
  opened: boolean;
  onClose: () => void;
  notification: Notification | null;
  isLoading?: boolean;
}

export const ResponseDrawer = (props: ResponseDrawerProps) => {
  const { opened, onClose, notification, isLoading = false } = props;
  const navigate = useNavigate();
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const senderId = notification?.senderId ?? notification?.creatorId;
  const canOpenSender = Boolean(senderId);

  const handleSenderClick = () => {
    if (senderId) {
      navigate(
        RoutePath[AppRoutes.USER_PROFILE].replace(':id', String(senderId)),
      );
      onClose();
    }
  };

  const handleServiceClick = () => {
    if (notification?.publicationId) {
      navigate(
        RoutePath[AppRoutes.SERVICE_DETAIL].replace(
          ':id',
          String(notification.publicationId),
        ),
      );
      onClose();
    }
  };
  const canOpenNeed = Boolean(notification?.publicationId);

  const senderName = notification?.initiator
    ? `${notification.initiator.firstName ?? ''} ${notification.initiator.lastName ?? ''}`.trim()
    : notification?.creatorName;
  const senderDisplayName = senderName || 'Пользователь';

  const senderUsername = notification?.initiator?.username;
  const senderMeta = [
    notification?.initiator?.profession,
    notification?.initiator?.city,
  ]
    .filter(Boolean)
    .join(', ');

  const handleMessageClick = async () => {
    if (!senderId) {
      return;
    }

    setIsOpeningChat(true);
    try {
      const opened = await openSenderTelegram({
        initiator: notification?.initiator,
        senderId,
      });

      if (opened) {
        onClose();
      }
    } finally {
      setIsOpeningChat(false);
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size={520}
      withCloseButton={false}
      radius={32}
      transitionProps={{
        transition: 'slide-up',
        duration: 300,
        timingFunction: 'ease',
      }}
      overlayProps={{ blur: 3, backgroundOpacity: 0.5 }}
      styles={{
        content: {
          background: 'var(--tertiary-bg-color)',
          overflow: 'hidden',
          position: 'relative',
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0,
        },
      }}
    >
      {notification && (
        <>
          <Box className={classes.scrollContent}>
            <Stack gap={24} className={classes.sections}>
              <Text className={classes.title}>Отклик на потребность</Text>

              <Stack gap={16}>
                {(isLoading || notification.needDetails) && (
                  <Stack gap={8}>
                    <Text className={classes.sectionLabel}>Потребность</Text>
                    <Box
                      className={classes.infoCard}
                      onClick={
                        notification.needDetails && canOpenNeed
                          ? handleServiceClick
                          : undefined
                      }
                      style={{
                        cursor:
                          notification.needDetails && canOpenNeed
                            ? 'pointer'
                            : 'default',
                      }}
                    >
                      {isLoading && !notification.needDetails ? (
                        <Stack gap={6}>
                          <Skeleton height={12} radius="sm" width="70%" />
                          <Skeleton height={10} radius="sm" width="90%" />
                          <Skeleton height={10} radius="sm" width="75%" />
                        </Stack>
                      ) : (
                        notification.needDetails && (
                          <Stack gap={8}>
                            <Text className={classes.itemTitle}>
                              {notification.needDetails.title}
                            </Text>
                            <Text className={classes.itemDesc} lineClamp={3}>
                              {notification.needDetails.description}
                            </Text>
                          </Stack>
                        )
                      )}
                    </Box>
                  </Stack>
                )}

                <Stack gap={8}>
                  <Text className={classes.sectionLabel}>Отправитель</Text>
                  <Box
                    className={classes.infoCard}
                    onClick={canOpenSender ? handleSenderClick : undefined}
                    style={{ cursor: canOpenSender ? 'pointer' : 'default' }}
                  >
                    {isLoading ? (
                      <Group gap={12} wrap="nowrap">
                        <Skeleton circle height={40} width={40} />
                        <Stack gap={6} style={{ flex: 1 }}>
                          <Skeleton height={12} radius="sm" width="60%" />
                          <Skeleton height={10} radius="sm" width="45%" />
                          <Skeleton height={10} radius="sm" width="70%" />
                        </Stack>
                      </Group>
                    ) : (
                      <Group gap={12} wrap="nowrap">
                        <img
                          src={
                            notification.initiator?.avatarUrl ?? defaultUserSvg
                          }
                          alt={senderDisplayName}
                          className={classes.avatar}
                        />
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Text className={classes.senderName}>
                            {senderDisplayName}
                          </Text>
                          {senderUsername && (
                            <Text className={classes.senderUsername}>
                              @{senderUsername}
                            </Text>
                          )}
                          {senderMeta && (
                            <Text className={classes.senderMeta}>
                              {senderMeta}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    )}
                  </Box>
                </Stack>

                {(isLoading || notification.serviceDetails) && (
                  <Stack gap={8}>
                    <Text className={classes.sectionLabel}>
                      Привязанная услуга
                    </Text>
                    <Box
                      className={classes.infoCard}
                      onClick={
                        notification.serviceDetails
                          ? handleServiceClick
                          : undefined
                      }
                      style={{
                        cursor: notification.serviceDetails
                          ? 'pointer'
                          : 'default',
                      }}
                    >
                      {isLoading && !notification.serviceDetails ? (
                        <Group gap={12} wrap="nowrap">
                          <Skeleton height={40} radius="sm" width={40} />
                          <Stack gap={6} style={{ flex: 1 }}>
                            <Skeleton height={12} radius="sm" width="55%" />
                            <Skeleton height={10} radius="sm" width="80%" />
                            <Skeleton height={10} radius="sm" width="70%" />
                          </Stack>
                        </Group>
                      ) : (
                        notification.serviceDetails && (
                          <Group gap={12} wrap="nowrap">
                            <Box className={classes.thumbnail}>
                              {notification.serviceDetails.imageUrl && (
                                <img
                                  src={notification.serviceDetails.imageUrl}
                                  alt={notification.serviceDetails.title}
                                  className={classes.thumbnailImg}
                                />
                              )}
                            </Box>
                            <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                              <Text className={classes.itemTitle}>
                                {notification.serviceDetails.title}
                              </Text>
                              <Text className={classes.itemDesc} lineClamp={3}>
                                {notification.serviceDetails.description}
                              </Text>
                            </Stack>
                          </Group>
                        )
                      )}
                    </Box>
                  </Stack>
                )}

                {notification.message && (
                  <Stack gap={8}>
                    <Text className={classes.sectionLabel}>Комментарий</Text>
                    <Text className={classes.comment}>
                      {notification.message}
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Box>

          <Group gap={8} className={classes.footer}>
            <ActionIcon
              variant="outline"
              size={48}
              radius={16}
              onClick={onClose}
              className={classes.closeButton}
            >
              <XIcon />
            </ActionIcon>
            <Button
              radius={16}
              h={48}
              style={{ flex: 1 }}
              loading={isOpeningChat}
              disabled={!senderId}
              onClick={handleMessageClick}
              className={classes.messageButton}
            >
              Написать
            </Button>
          </Group>
        </>
      )}
    </Drawer>
  );
};
