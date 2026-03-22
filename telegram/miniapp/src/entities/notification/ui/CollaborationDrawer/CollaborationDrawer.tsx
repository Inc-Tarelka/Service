import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { XIcon } from 'shared/assets/icons/x';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import { useNavigate } from 'react-router-dom';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import classes from './CollaborationDrawer.module.scss';

interface Sender {
  name: string;
  username: string;
  meta: string;
  avatarUrl?: string;
}

interface LinkedItem {
  title: string;
  description: string;
  thumbnailUrl?: string;
}

interface CollaborationDrawerProps {
  opened: boolean;
  onClose: () => void;
  sender: Sender;
  project: LinkedItem;
  comment: string;
}

export const CollaborationDrawer = (props: CollaborationDrawerProps) => {
  const { opened, onClose, sender, project, comment } = props;
  const navigate = useNavigate();

  const handleSenderClick = () => {
    navigate(RoutePath[AppRoutes.USER_PROFILE].replace(':id', '2'));
    onClose();
  };

  const handleProjectClick = () => {
    navigate(RoutePath[AppRoutes.SERVICE_DETAIL].replace(':id', '86'));
    onClose();
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
      <Box className={classes.scrollContent}>
        <Stack gap={24} className={classes.sections}>
          <Text className={classes.title}>Запрос на сотрудничество</Text>

          <Stack gap={16}>
            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Отправитель</Text>
              <Box
                className={classes.infoCard}
                onClick={handleSenderClick}
                style={{ cursor: 'pointer' }}
              >
                <Group gap={12} wrap="nowrap">
                  <img
                    src={sender.avatarUrl ?? defaultUserSvg}
                    alt={sender.name}
                    className={classes.avatar}
                  />
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text className={classes.senderName}>{sender.name}</Text>
                    <Text className={classes.senderUsername}>
                      @{sender.username}
                    </Text>
                    <Text className={classes.senderMeta}>{sender.meta}</Text>
                  </Stack>
                </Group>
              </Box>
            </Stack>

            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Привязанный проект</Text>
              <Box
                className={classes.infoCard}
                onClick={handleProjectClick}
                style={{ cursor: 'pointer' }}
              >
                <Group gap={12} wrap="nowrap">
                  <Box className={classes.thumbnail}>
                    {project.thumbnailUrl && (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className={classes.thumbnailImg}
                      />
                    )}
                  </Box>
                  <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                    <Text className={classes.itemTitle}>{project.title}</Text>
                    <Text className={classes.itemDesc} lineClamp={3}>
                      {project.description}
                    </Text>
                  </Stack>
                </Group>
              </Box>
            </Stack>

            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Комментарий</Text>
              <Text className={classes.comment}>{comment}</Text>
            </Stack>
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
          radius={16}
          h={48}
          style={{ flex: 1 }}
          onClick={onClose}
          className={classes.messageButton}
        >
          Написать
        </Button>
      </Group>
    </Drawer>
  );
};
