import { ActionIcon, Box, Button, Drawer, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
import XIcon from 'shared/assets/icons/x';
import { ActionsDrawer } from '../ActionsDrawer/ActionsDrawer';
import classes from './OfferDetailsDrawer.module.scss';

interface OfferDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  interaction: Interaction;
  onDelete?: () => void;
}

export const OfferDetailsDrawer = ({
  opened,
  onClose,
  interaction,
  onDelete,
}: OfferDetailsDrawerProps) => {
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
        size={550}
        withCloseButton={false}
        padding={24}
        radius={40}
      >
        <Stack gap={30}>
          <h1 className={classes.title}>Отклик на потребность</h1>

          <Stack gap={16}>
            <Box>
              <h2 className={classes.sectionTitle}>Потребность</h2>
              <Box className={classes.card}>
                <Text color="white" className={classes.cardTitle}>
                  {interaction.needDetails?.title}
                </Text>
                <Text className={classes.cardDescriptionNeed}>
                  {interaction.needDetails?.description}
                </Text>
              </Box>
            </Box>

            <Box>
              <h2 className={classes.sectionTitle}>Привязанная услуга</h2>
              <Box className={classes.card}>
                <Box className={classes.serviceContent}>
                  {interaction.serviceDetails?.imageUrl && (
                    <img
                      src={interaction.serviceDetails.imageUrl}
                      alt={interaction.serviceDetails.title}
                      className={classes.serviceImage}
                    />
                  )}
                  <Box className={classes.serviceText}>
                    <Text color="white" className={classes.cardTitle}>
                      {interaction.serviceDetails?.title}
                    </Text>
                    <Text className={classes.cardDescription}>
                      {interaction.serviceDetails?.description}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {interaction.comment && (
              <Box>
                <h2 className={classes.sectionTitle}>Комментарий</h2>
                <Text color="white" className={classes.comment}>
                  {interaction.comment}
                </Text>
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
        fullWidth
        title="Вы уверены, что хотите удалить отклик?"
      />
    </>
  );
};
