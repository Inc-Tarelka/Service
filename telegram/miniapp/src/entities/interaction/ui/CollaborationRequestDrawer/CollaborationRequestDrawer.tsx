import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Drawer,
  Group,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { Notification } from 'shared/api/service/Notification/types';
import XIcon from 'shared/assets/icons/x';
import { ActionsDrawer } from '../ActionsDrawer/ActionsDrawer';
import classes from './CollaborationRequestDrawer.module.scss';

interface CollaborationRequestDrawerProps {
  opened: boolean;
  onClose: () => void;
  notification: Notification;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  isLoading?: boolean;
}

export const CollaborationRequestDrawer = (
  props: CollaborationRequestDrawerProps,
) => {
  const {
    opened,
    onClose,
    notification,
    onDelete,
    isDeleting,
    isLoading = false,
  } = props;
  const [isDeleteDrawerOpen, setDeleteDrawerOpen] = useState(false);

  const handleDelete = () => {
    onDelete?.(notification.id);
    setDeleteDrawerOpen(false);
    onClose();
  };

  return (
    <>
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
            <Text className={classes.title}>Запрос на сотрудничество</Text>

            <Stack gap={16}>
              {(isLoading || notification.initiator) && (
                <Stack gap={8}>
                  <Text className={classes.sectionTitle}>Кому</Text>
                  <Box className={classes.card}>
                    {isLoading && !notification.initiator ? (
                      <Group gap={12} align="center">
                        <Skeleton circle height={40} width={40} />
                        <Stack gap={6} style={{ flex: 1 }}>
                          <Skeleton height={14} radius="sm" width="50%" />
                          <Skeleton height={12} radius="sm" width="35%" />
                          <Skeleton height={12} radius="sm" width="65%" />
                        </Stack>
                      </Group>
                    ) : (
                      notification.initiator && (
                        <Group gap={12} align="center">
                          <Avatar
                            src={notification.initiator.avatarUrl}
                            size={40}
                            radius="xl"
                          />
                          <Box className={classes.userInfo}>
                            <Text className={classes.cardTitle}>
                              {notification.initiator.firstName}{' '}
                              {notification.initiator.lastName}
                            </Text>
                            {notification.initiator.username && (
                              <Text className={classes.cardDescription}>
                                @{notification.initiator.username}
                              </Text>
                            )}
                            {(notification.initiator.profession ||
                              notification.initiator.city) && (
                              <Text className={classes.cardDescription}>
                                {[
                                  notification.initiator.profession,
                                  notification.initiator.city,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </Text>
                            )}
                          </Box>
                        </Group>
                      )
                    )}
                  </Box>
                </Stack>
              )}

              {(isLoading || notification.projectDetails) && (
                <Stack gap={8}>
                  <Text className={classes.sectionTitle}>
                    Привязанный проект
                  </Text>
                  <Box className={classes.card}>
                    {isLoading && !notification.projectDetails ? (
                      <Stack gap={10}>
                        <Skeleton height={48} radius="sm" width={48} />
                        <Skeleton height={14} radius="sm" width="55%" />
                        <Skeleton height={12} radius="sm" width="80%" />
                        <Skeleton height={12} radius="sm" width="70%" />
                      </Stack>
                    ) : (
                      notification.projectDetails && (
                        <Box className={classes.projectContent}>
                          {notification.projectDetails.imageUrl && (
                            <img
                              src={notification.projectDetails.imageUrl}
                              alt={notification.projectDetails.title}
                              className={classes.projectImage}
                            />
                          )}
                          <Box className={classes.projectText}>
                            <Text className={classes.cardTitle}>
                              {notification.projectDetails.title}
                            </Text>
                            <Text className={classes.cardDescription}>
                              {notification.projectDetails.description}
                            </Text>
                          </Box>
                        </Box>
                      )
                    )}
                  </Box>
                </Stack>
              )}

              {notification.message && (
                <Stack gap={8}>
                  <Text className={classes.sectionTitle}>Комментарий</Text>
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
            radius={12}
            onClick={onClose}
            className={classes.closeButton}
          >
            <XIcon />
          </ActionIcon>
          <Button
            className={classes.deleteButton}
            variant="outline"
            radius={16}
            h={48}
            style={{ flex: 1 }}
            onClick={() => setDeleteDrawerOpen(true)}
            loading={isDeleting}
          >
            Удалить
          </Button>
        </Group>
      </Drawer>

      <ActionsDrawer
        opened={isDeleteDrawerOpen}
        onClose={() => setDeleteDrawerOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
};
