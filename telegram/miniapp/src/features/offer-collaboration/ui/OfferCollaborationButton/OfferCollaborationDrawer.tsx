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
import { useTheme } from 'app/providers/ThemeProvider';
import { useStore } from 'app/StoreProvider';
import { useEffect, useState } from 'react';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import type { MyProject } from 'shared/api/service/Publication/types';
import { getMyProjects } from 'shared/api/service/Publication/api';
import { classNames } from 'shared/library/ClassNames/classNames';
import { ProjectPickerDrawer } from './ProjectPickerDrawer';
import classes from './OfferCollaborationButton.module.scss';

interface OfferCollaborationDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OfferCollaborationDrawer = (
  props: OfferCollaborationDrawerProps,
) => {
  const { userId, isOpen, onClose } = props;
  const { theme } = useTheme();
  const { notificationCollaborationStore } = useStore();

  const [comment, setComment] = useState('');
  const [selectedProject, setSelectedProject] = useState<MyProject | null>(
    null,
  );
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingProjects(true);
      getMyProjects()
        .then(setProjects)
        .catch(() => setProjects([]))
        .finally(() => setIsLoadingProjects(false));
    }
  }, [isOpen]);

  const handleClose = () => {
    setComment('');
    setSelectedProject(null);
    setIsPickerOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedProject) return;
    const success =
      await notificationCollaborationStore.sendCollaborationAction({
        message: comment,
        publicationId: selectedProject.id,
        receiverId: Number(userId),
      });
    if (success) {
      handleClose();
    }
  };

  const { isSending } = notificationCollaborationStore;
  const canSubmit = !!selectedProject && !isSending;

  return (
    <>
      <Drawer
        opened={isOpen}
        onClose={handleClose}
        size="lg"
        position="bottom"
        withCloseButton={false}
        zIndex={200}
        className={theme}
        styles={{
          content: {
            backgroundColor: 'var(--tertiary-bg-color)',
            borderRadius: '32px 32px 0 0',
          },
          body: {
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        }}
      >
        <div className={classNames(classes.drawerContent, {}, [theme])}>
          <h2 className={classes.drawerTitle}>Запрос на сотрудничество</h2>

          <div className={classes.section}>
            <span className={classes.label}>Привязанный проект</span>
            {selectedProject ? (
              <Box
                className={classes.selectedProjectCard}
                onClick={() => setIsPickerOpen(true)}
              >
                <Group gap={12} wrap="nowrap">
                  <div className={classes.projectThumb}>
                    {selectedProject.image && (
                      <img
                        src={selectedProject.image}
                        alt={selectedProject.name}
                        className={classes.projectThumbImg}
                      />
                    )}
                  </div>
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text className={classes.projectName} lineClamp={1}>
                      {selectedProject.name}
                    </Text>
                    <Text className={classes.projectDesc} lineClamp={2}>
                      {selectedProject.description}
                    </Text>
                  </Stack>
                </Group>
              </Box>
            ) : (
              <Button
                variant="outline"
                leftSection={<PlusIcon />}
                fullWidth
                radius="xl"
                size="lg"
                onClick={() => setIsPickerOpen(true)}
                styles={{
                  root: {
                    borderColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                  },
                }}
              >
                Добавить проект
              </Button>
            )}
          </div>

          <div className={classes.section}>
            <div className={classes.labelRow}>
              <span className={classes.label}>Комментарий</span>
              <span className={classes.charLimit}>{comment.length}/200</span>
            </div>
            <Textarea
              placeholder="Напишите сообщение..."
              value={comment}
              maxLength={200}
              onChange={(e) => setComment(e.target.value)}
              autosize
              minRows={5}
              styles={{
                input: {
                  border: '2px solid var(--card-bg)',
                  backgroundColor: 'var(--tertiary-bg-color)',
                  borderRadius: '16px',
                  color: 'var(--text-color)',
                  padding: '16px',
                  fontSize: '16px',
                },
              }}
            />
          </div>

          <div className={classes.actions}>
            <ActionIcon
              onClick={handleClose}
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
              <XIcon />
            </ActionIcon>
            <Button
              fullWidth
              radius="xl"
              size="lg"
              variant="filled"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={isSending}
              bg="var(--accent-color)"
              c="var(--bg-color)"
            >
              Отправить
            </Button>
          </div>
        </div>
      </Drawer>

      <ProjectPickerDrawer
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        projects={projects}
        isLoading={isLoadingProjects}
        onSelect={setSelectedProject}
      />
    </>
  );
};
