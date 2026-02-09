import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
import XIcon from 'shared/assets/icons/x';
import { ActionsDrawer } from '../ActionsDrawer/ActionsDrawer';
import classes from './CollaborationRequestDrawer.module.scss';

interface CollaborationRequestDrawerProps {
  opened: boolean;
  onClose: () => void;
  interaction: Interaction;
  onDelete?: () => void;
}

export const CollaborationRequestDrawer = ({
  opened,
  onClose,
  interaction,
  onDelete,
}: CollaborationRequestDrawerProps) => {
  const [isDeleteDrawerOpen, setDeleteDrawerOpen] = useState(false);

  const handleDelete = () => {
    onDelete?.();
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
        padding={24}
        radius={40}
      >
        <Stack gap={30}>
          <h1 className={classes.title}>Запрос на сотрудничество</h1>

          <Stack gap={16}>
            <Box>
              <h2 className={classes.sectionTitle}>Кому</h2>
              <Box className={classes.card}>
                <Group gap={12} align="center">
                  <Avatar
                    src={interaction.initiator.avatarUrl}
                    size={40}
                    radius="xl"
                  />
                  <Box className={classes.userInfo}>
                    <Text color="white" className={classes.cardTitle}>
                      {interaction.initiator.firstName}{' '}
                      {interaction.initiator.lastName}
                    </Text>
                    <Text className={classes.cardDescription}>
                      @{interaction.initiator.username}
                    </Text>
                    <Text color="white" className={classes.cardDescription}>
                      {interaction.initiator.profession},{' '}
                      {interaction.initiator.city}
                    </Text>
                  </Box>
                </Group>
              </Box>
            </Box>

            {interaction.projectDetails && (
              <Box>
                <h2 className={classes.sectionTitle}>Привязанный проект</h2>
                <Box className={classes.card}>
                  <Box className={classes.projectContent}>
                    {interaction.projectDetails.imageUrl && (
                      <img
                        src={interaction.projectDetails.imageUrl}
                        alt={interaction.projectDetails.title}
                        className={classes.projectImage}
                      />
                    )}
                    <Box className={classes.projectText}>
                      <Text color="white" className={classes.cardTitle}>
                        {interaction.projectDetails.title}
                      </Text>
                      <Text className={classes.cardDescription}>
                        {interaction.projectDetails.description}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {interaction.comment && (
              <Box>
                <h2 className={classes.sectionTitle}>Комментарий</h2>
                <p className={classes.comment}>{interaction.comment}</p>
              </Box>
            )}
          </Stack>

          <div className={classes.footer}>
            <ActionIcon
              onClick={onClose}
              variant="outline"
              size={48}
              radius={40}
            >
              <XIcon />
            </ActionIcon>
            <Button
              className={classes.deleteButton}
              variant="outline"
              fullWidth
              radius="xl"
              size="lg"
              onClick={() => setDeleteDrawerOpen(true)}
            >
              Удалить
            </Button>
          </div>
        </Stack>
      </Drawer>

      <ActionsDrawer
        opened={isDeleteDrawerOpen}
        onClose={() => setDeleteDrawerOpen(false)}
        onDelete={handleDelete}
      />
    </>
  );
};
