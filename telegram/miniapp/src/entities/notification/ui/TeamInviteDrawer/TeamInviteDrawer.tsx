import { Box, Button, Drawer, Group, Stack, Text } from '@mantine/core';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import { useNavigate } from 'react-router-dom';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import type { Notification } from 'shared/api/service/Notification/types';
import classes from './TeamInviteDrawer.module.scss';

interface TeamInviteDrawerProps {
  opened: boolean;
  onClose: () => void;
  notification: Notification | null;
  onAccept: (notificationId: number) => void | Promise<void>;
  onDelete: (notificationId: number) => void | Promise<void>;
  isResponding?: boolean;
  isDeleting?: boolean;
}

export const TeamInviteDrawer = (props: TeamInviteDrawerProps) => {
  const {
    opened,
    onClose,
    notification,
    onAccept,
    onDelete,
    isResponding = false,
    isDeleting = false,
  } = props;
  const navigate = useNavigate();

  if (!notification) return null;

  const senderId = notification.senderId ?? notification.creatorId;
  const canOpenSender = Boolean(senderId);

  const handleSenderClick = () => {
    if (senderId) {
      navigate(
        RoutePath[AppRoutes.USER_PROFILE].replace(':id', String(senderId)),
      );
      onClose();
    }
  };

  const handleProjectClick = () => {
    if (notification.publicationId) {
      navigate(
        RoutePath[AppRoutes.SERVICE_DETAIL].replace(
          ':id',
          String(notification.publicationId),
        ),
      );
      onClose();
    }
  };

  const handleAccept = async () => {
    await onAccept(notification.id);
  };

  const handleDelete = async () => {
    await onDelete(notification.id);
  };

  const senderName = notification.initiator
    ? `${notification.initiator.firstName ?? ''} ${notification.initiator.lastName ?? ''}`.trim()
    : notification.creatorName;
  const senderDisplayName = senderName || 'Пользователь';
  const senderUsername = notification.initiator?.username;
  const senderMeta = [
    notification.initiator?.profession,
    notification.initiator?.city,
  ]
    .filter(Boolean)
    .join(', ');

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
      <Box className={classes.scrollContent}>
        <Stack gap={24} className={classes.sections}>
          <Text className={classes.title}>Приглашение в команду</Text>

          <Stack gap={16}>
            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Отправитель</Text>
              <Box
                className={classes.infoCard}
                onClick={canOpenSender ? handleSenderClick : undefined}
                style={{ cursor: canOpenSender ? 'pointer' : 'default' }}
              >
                <Group gap={12} wrap="nowrap">
                  <img
                    src={notification.initiator?.avatarUrl ?? defaultUserSvg}
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
                      <Text className={classes.senderMeta}>{senderMeta}</Text>
                    )}
                  </Stack>
                </Group>
              </Box>
            </Stack>

            {notification.projectDetails && (
              <Stack gap={8}>
                <Text className={classes.sectionLabel}>Проект</Text>
                <Box
                  className={classes.infoCard}
                  onClick={handleProjectClick}
                  style={{ cursor: 'pointer' }}
                >
                  <Group gap={12} wrap="nowrap">
                    <Box className={classes.thumbnail}>
                      {notification.projectDetails.imageUrl && (
                        <img
                          src={notification.projectDetails.imageUrl}
                          alt={notification.projectDetails.title}
                          className={classes.thumbnailImg}
                        />
                      )}
                    </Box>
                    <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                      <Text className={classes.itemTitle}>
                        {notification.projectDetails.title}
                      </Text>
                      <Text className={classes.itemDesc} lineClamp={3}>
                        {notification.projectDetails.description}
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              </Stack>
            )}

            {notification.message && (
              <Stack gap={8}>
                <Text className={classes.sectionLabel}>Комментарий</Text>
                <Text className={classes.comment}>{notification.message}</Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>

      <Group gap={8} className={classes.footer}>
        <Button
          radius={16}
          h={48}
          variant="outline"
          className={classes.deleteButton}
          loading={isDeleting}
          onClick={handleDelete}
        >
          Удалить
        </Button>
        <Button
          radius={16}
          h={48}
          className={classes.acceptButton}
          loading={isResponding}
          onClick={handleAccept}
        >
          Да, я согласен
        </Button>
      </Group>
    </Drawer>
  );
};
