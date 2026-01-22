import { Box, Button, Drawer, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
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
          <Text color="white" className={classes.title}>
            Отклик на потребность
          </Text>

          <Stack gap={16}>
            <Box>
              <Text color="white" className={classes.sectionTitle}>
                Потребность
              </Text>
              <Box className={classes.card}>
                <Text color="white" className={classes.cardTitle}>
                  {interaction.needDetails?.title}
                </Text>
                <Text className={classes.cardDescription}>
                  {interaction.needDetails?.description}
                </Text>
              </Box>
            </Box>

            <Box>
              <Text color="white" className={classes.sectionTitle}>
                Привязанная услуга
              </Text>
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
        title="Вы уверены, что хотите удалить отклик?"
      />
    </>
  );
};
