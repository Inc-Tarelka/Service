import { Avatar, Box, Button, Drawer, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
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
        size={500}
        withCloseButton={false}
        padding={24}
        radius={40}
      >
        <Stack gap={30}>
          <Text color="white" className={classes.title}>
            Запрос на сотрудничество
          </Text>

          <Stack gap={16}>
            <Box>
              <Text color="white" className={classes.sectionTitle}>
                Кому
              </Text>
              <Box className={classes.card}>
                <Group gap={12} align="flex-start">
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
                <Text color="white" className={classes.sectionTitle}>
                  Привязанный проект
                </Text>
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
                <Text color="white" className={classes.sectionTitle}>
                  Комментарий
                </Text>
                <Text color="white" className={classes.comment}>
                  {interaction.comment}
                </Text>
              </Box>
            )}
          </Stack>

          <Button
            variant="outline"
            fullWidth
            radius="xl"
            size="lg"
            onClick={() => setDeleteDrawerOpen(true)}
          >
            Удалить
          </Button>
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
