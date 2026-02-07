import {
  ActionIcon,
  Button,
  Drawer,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useState } from 'react';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import classes from './ResponseToNeedDrawer.module.scss';

interface ResponseToNeedDrawerProps {
  opened: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
}

export const ResponseToNeedDrawer = ({
  opened,
  onClose,
  onBack,
  onSubmit,
}: ResponseToNeedDrawerProps) => {
  const [comment, setComment] = useState('');
  const maxCommentLength = 1000;

  const handleSubmit = () => {
    onSubmit?.();
    onClose();
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      withCloseButton={false}
      padding={24}
      radius={40}
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className={classes.container}>
        <div className={classes.content}>
          <Text color="white" className={classes.title}>
            Отклик на потребность
          </Text>

          <Stack gap={16}>
            <div>
              <Text color="white" className={classes.sectionTitle}>
                Привязанная услуга
              </Text>
              <Button
                variant="outline"
                fullWidth
                radius="xl"
                size="lg"
                leftSection={<span style={{ fontSize: '20px' }}>+</span>}
              >
                Добавить
              </Button>
            </div>

            <div>
              <div className={classes.commentHeader}>
                <Text color="white" className={classes.sectionTitle}>
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
            radius="40"
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
          >
            Отправить
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
