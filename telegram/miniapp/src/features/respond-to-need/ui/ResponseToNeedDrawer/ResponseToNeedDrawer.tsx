import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { useEffect, useState } from 'react';
import PlusIcon from 'shared/assets/icons/plus';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import { getMyProjects } from 'shared/api/service/Publication/api';
import classes from './ResponseToNeedDrawer.module.scss';
import { ServicePickerDrawer, type MyService } from './ServicePickerDrawer';

interface ResponseToNeedDrawerProps {
  opened: boolean;
  onClose: () => void;
  onBack?: () => void;
  needId: number | null;
  receiverId: number | null;
}

export const ResponseToNeedDrawer = (props: ResponseToNeedDrawerProps) => {
  const { opened, onClose, onBack, needId, receiverId } = props;
  const { notificationNeedResponseStore } = useStore();

  const [comment, setComment] = useState('');
  const [selectedService, setSelectedService] = useState<MyService | null>(
    null,
  );
  const [services, setServices] = useState<MyService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const maxCommentLength = 1000;

  useEffect(() => {
    if (opened) {
      setIsLoadingServices(true);
      getMyProjects()
        .then(setServices)
        .catch(() => setServices([]))
        .finally(() => setIsLoadingServices(false));
    }
  }, [opened]);

  const handleClose = () => {
    setComment('');
    setSelectedService(null);
    setIsPickerOpen(false);
    onClose();
  };

  const handleBack = () => {
    onBack?.();
  };

  const handleSubmit = async () => {
    if (!selectedService) return;
    const success = await notificationNeedResponseStore.sendNeedResponseAction({
      message: comment,
      needId: needId ?? 1,
      publicationId: selectedService.id,
      receiverId: receiverId ?? 1,
    });
    if (success) {
      handleClose();
    }
  };

  const { isSending } = notificationNeedResponseStore;
  const canSubmit = !!selectedService && !isSending;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        position="bottom"
        size="100%"
        withCloseButton={false}
        padding={24}
        radius={40}
        zIndex={300}
        classNames={{
          body: classes.body,
          content: 'drawer-fulldevice',
        }}
      >
        <div className={classes.scrollArea}>
          <Text c="var(--text-color)" className={classes.title}>
            Отклик на потребность
          </Text>

          <Stack gap={16}>
            <div>
              <h2 className={classes.sectionTitle}>Привязанная услуга</h2>
              {selectedService ? (
                <Box
                  className={classes.selectedServiceCard}
                  onClick={() => setIsPickerOpen(true)}
                >
                  <Group gap={12} wrap="nowrap">
                    <div className={classes.pickerThumb}>
                      {selectedService.image && (
                        <img
                          src={selectedService.image}
                          alt={selectedService.name}
                          className={classes.pickerThumbImg}
                        />
                      )}
                    </div>
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text className={classes.pickerName} lineClamp={1}>
                        {selectedService.name}
                      </Text>
                      <Text className={classes.pickerDesc} lineClamp={2}>
                        {selectedService.description}
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  radius="xl"
                  size="lg"
                  leftSection={<PlusIcon />}
                  onClick={() => setIsPickerOpen(true)}
                  styles={{
                    root: {
                      borderColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                    },
                  }}
                >
                  Добавить услугу
                </Button>
              )}
            </div>

            <div>
              <div className={classes.commentHeader}>
                <Text c="var(--text-color)" className={classes.sectionTitle}>
                  Комментарий
                </Text>
                <Text className={classes.commentCounter}>
                  {comment.length}/{maxCommentLength}
                </Text>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                maxLength={maxCommentLength}
                className={classes.textarea}
                minRows={6}
                maxRows={12}
                autosize
              />
            </div>
          </Stack>
        </div>

        <div className={classes.footer}>
          <ActionIcon
            onClick={handleBack}
            variant="outline"
            size={48}
            radius="16"
            styles={{
              root: {
                border: '1px solid var(--inverted-bg-color)',
                color: 'var(--text-color)',
                backgroundColor: 'transparent',
                flexShrink: 0,
              },
            }}
          >
            <ArrowLeftIcon />
          </ActionIcon>
          <Button
            className={classes.submitButton}
            onClick={handleSubmit}
            radius="xl"
            variant="filled"
            fullWidth
            size="lg"
            bg="var(--accent-color)"
            c="var(--bg-color)"
            loading={isSending}
            disabled={!canSubmit}
            styles={{
              root: {
                border: '1px solid var(--accent-color)',
                opacity: canSubmit ? 1 : 0.5,
              },
            }}
          >
            Отправить
          </Button>
        </div>
      </Drawer>

      <ServicePickerDrawer
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        services={services}
        isLoading={isLoadingServices}
        onSelect={setSelectedService}
      />
    </>
  );
};
