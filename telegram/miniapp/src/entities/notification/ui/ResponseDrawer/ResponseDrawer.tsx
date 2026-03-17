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
import classes from './ResponseDrawer.module.scss';

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

interface ResponseDrawerProps {
  opened: boolean;
  onClose: () => void;
  need: LinkedItem;
  sender: Sender;
  service: LinkedItem;
  comment: string;
  onMessage?: () => void;
}

export const ResponseDrawer = (props: ResponseDrawerProps) => {
  const { opened, onClose, need, sender, service, comment, onMessage } = props;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto"
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
            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Потребность</Text>
              <Box className={classes.infoCard}>
                <Stack gap={8}>
                  <Text className={classes.itemTitle}>{need.title}</Text>
                  <Text className={classes.itemDesc} lineClamp={3}>
                    {need.description}
                  </Text>
                </Stack>
              </Box>
            </Stack>

            <Stack gap={8}>
              <Text className={classes.sectionLabel}>Отправитель</Text>
              <Box className={classes.infoCard}>
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
              <Text className={classes.sectionLabel}>Привязанная услуга</Text>
              <Box className={classes.infoCard}>
                <Group gap={12} wrap="nowrap">
                  <Box className={classes.thumbnail}>
                    {service.thumbnailUrl && (
                      <img
                        src={service.thumbnailUrl}
                        alt={service.title}
                        className={classes.thumbnailImg}
                      />
                    )}
                  </Box>
                  <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                    <Text className={classes.itemTitle}>{service.title}</Text>
                    <Text className={classes.itemDesc} lineClamp={3}>
                      {service.description}
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
          onClick={onMessage}
          className={classes.messageButton}
        >
          Написать
        </Button>
      </Group>
    </Drawer>
  );
};
