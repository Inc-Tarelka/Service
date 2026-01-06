import {
  ActionIcon,
  Card,
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { UserAvatar } from 'entities/user';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
import EyeCloseIcon from 'shared/assets/icons/EyeClose';
import MoreIcon from 'shared/assets/icons/more';
import TrashIcon from 'shared/assets/icons/trash';
import classes from './InteractionItem.module.scss';

interface InteractionItemProps {
  interaction: Interaction;
  canEdit?: boolean;
  onClick?: () => void;
}

export const InteractionItem = ({
  interaction,
  canEdit,
  onClick,
}: InteractionItemProps) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Card padding="md" radius="md" className={classes.card} onClick={onClick}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              {interaction.title}
            </Text>

            <Text size="sm" fw={500} lineClamp={3}>
              {interaction.description}
            </Text>

            {interaction.projectName && (
              <Group gap="xs" mt={4}>
                <UserAvatar src={interaction.initiator.avatarUrl} size={24} />
                <Text size="xs" c="dimmed">
                  {interaction.projectName}
                </Text>
              </Group>
            )}

            <Group gap="sm" mt="xs">
              <UserAvatar src={interaction.initiator.avatarUrl} size={32} />
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {interaction.initiator.firstName}{' '}
                  {interaction.initiator.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  @{interaction.initiator.username}
                </Text>
              </Stack>
            </Group>
          </Stack>

          {canEdit && (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setOpen(true)}
            >
              <MoreIcon />
            </ActionIcon>
          )}
        </Group>
      </Card>
      <Drawer opened={isOpen} onClose={() => setOpen(false)} size={135}>
        <Stack gap="xs">
          <UnstyledButton
            className={classes.sheetButton}
            onClick={() => setOpen(false)}
          >
            <Group gap="md">
              <EyeCloseIcon />
              <Text size="md" fw={500} c="white">
                Скрыть
              </Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={classes.sheetButton}
            onClick={() => setOpen(false)}
          >
            <Group gap="md">
              <TrashIcon color="#ff5d5d" />
              <Text size="md" fw={500} c="red">
                Удалить
              </Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </Drawer>
    </>
  );
};
