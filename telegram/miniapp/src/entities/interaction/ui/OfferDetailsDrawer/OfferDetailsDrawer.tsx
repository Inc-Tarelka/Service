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
import { useNavigate } from 'react-router-dom';
import { Notification } from 'shared/api/service/Notification/types';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import XIcon from 'shared/assets/icons/x';
import { ActionsDrawer } from '../ActionsDrawer/ActionsDrawer';
import classes from './OfferDetailsDrawer.module.scss';

interface OfferDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  notification: Notification;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  isLoading?: boolean;
}

export const OfferDetailsDrawer = (props: OfferDetailsDrawerProps) => {
  const {
    opened,
    onClose,
    notification,
    onDelete,
    isDeleting,
    isLoading = false,
  } = props;
  const navigate = useNavigate();
  const [isDeleteDrawerOpen, setDeleteDrawerOpen] = useState(false);

  const canOpenLinkedService = Boolean(notification.publicationId);

  const handleNeedClick = () => {
    if (!notification.publicationId) return;
    navigate(
      RoutePath[AppRoutes.SERVICE_DETAIL].replace(
        ':id',
        String(notification.publicationId),
      ),
    );
    onClose();
  };

  const handleServiceClick = () => {
    if (!notification.publicationId) return;
    navigate(
      RoutePath[AppRoutes.SERVICE_DETAIL].replace(
        ':id',
        String(notification.publicationId),
      ),
    );
    onClose();
  };

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
            <Text className={classes.title}>Отклик на потребность</Text>

            <Stack gap={16}>
              {(isLoading || notification.needDetails) && (
                <Stack gap={8}>
                  <Text className={classes.sectionTitle}>Потребность</Text>
                  <Box
                    className={classes.card}
                    onClick={
                      notification.needDetails && canOpenLinkedService
                        ? handleNeedClick
                        : undefined
                    }
                    style={{
                      cursor:
                        notification.needDetails && canOpenLinkedService
                          ? 'pointer'
                          : 'default',
                    }}
                  >
                    {isLoading && !notification.needDetails ? (
                      <Stack gap={8}>
                        <Skeleton height={14} radius="sm" width="60%" />
                        <Skeleton height={12} radius="sm" width="90%" />
                        <Skeleton height={12} radius="sm" width="70%" />
                      </Stack>
                    ) : (
                      notification.needDetails && (
                        <>
                          <Text color="white" className={classes.cardTitle}>
                            {notification.needDetails.title}
                          </Text>
                          <Text className={classes.cardDescriptionNeed}>
                            {notification.needDetails.description}
                          </Text>
                        </>
                      )
                    )}
                  </Box>
                </Stack>
              )}

              {(isLoading || notification.serviceDetails) && (
                <Stack gap={8}>
                  <Text className={classes.sectionTitle}>
                    Привязанная услуга
                  </Text>
                  <Box
                    className={classes.card}
                    onClick={
                      notification.serviceDetails && canOpenLinkedService
                        ? handleServiceClick
                        : undefined
                    }
                    style={{
                      cursor:
                        notification.serviceDetails && canOpenLinkedService
                          ? 'pointer'
                          : 'default',
                    }}
                  >
                    {isLoading && !notification.serviceDetails ? (
                      <Stack gap={10}>
                        <Skeleton height={48} radius="sm" width={48} />
                        <Skeleton height={14} radius="sm" width="55%" />
                        <Skeleton height={12} radius="sm" width="85%" />
                        <Skeleton height={12} radius="sm" width="75%" />
                      </Stack>
                    ) : (
                      notification.serviceDetails && (
                        <Box className={classes.serviceContent}>
                          {notification.serviceDetails.imageUrl && (
                            <img
                              src={notification.serviceDetails.imageUrl}
                              alt={notification.serviceDetails.title}
                              className={classes.serviceImage}
                            />
                          )}
                          <Box className={classes.serviceText}>
                            <Text color="white" className={classes.cardTitle}>
                              {notification.serviceDetails.title}
                            </Text>
                            <Text className={classes.cardDescription}>
                              {notification.serviceDetails.description}
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
                  <Text color="white" className={classes.comment}>
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
        fullWidth
        title="Вы уверены, что хотите удалить отклик?"
      />
    </>
  );
};
