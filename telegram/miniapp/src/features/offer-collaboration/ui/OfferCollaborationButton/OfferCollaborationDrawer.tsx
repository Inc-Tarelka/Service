import { ActionIcon, Button, Drawer, Textarea } from '@mantine/core';
import { useTheme } from 'app/providers/ThemeProvider';
import { useState } from 'react';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import classNames from 'shared/library/ClassNames/classNames';
import classes from './OfferCollaborationButton.module.scss';

interface OfferCollaborationDrawerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OfferCollaborationDrawer = ({
  userId,
  isOpen,
  onClose,
}: OfferCollaborationDrawerProps) => {
  const [comment, setComment] = useState('');
  const { theme } = useTheme();

  const handleSubmit = () => {
    console.log('Sending offer to', userId, comment);
    onClose();
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      size="lg"
      position="bottom"
      withCloseButton={false}
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
          <Button
            variant="outline"
            leftSection={<PlusIcon />}
            fullWidth
            radius="xl"
            size="lg"
          >
            Добавить проект
          </Button>
        </div>

        <div className={classes.section}>
          <div className={classes.labelRow}>
            <span className={classes.label}>Комментарий</span>
            <span className={classes.charLimit}>{comment.length}/50</span>
          </div>
          <Textarea
            placeholder="Напишите сообщение..."
            value={comment}
            maxLength={50}
            onChange={(e) => setComment(e.target.value)}
            autosize
            minRows={5}
            styles={{
              input: {
                border: '2px solid var(--card-bg)',
                backgroundColor: 'var(--tertiary-bg-color)',
                borderRadius: '24px',
                color: 'var(--text-color)',
                padding: '16px',
                fontSize: '16px',
              },
            }}
          />
        </div>

        <div className={classes.actions}>
          <ActionIcon
            onClick={onClose}
            variant="outline"
            size={48}
            radius="40"
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
