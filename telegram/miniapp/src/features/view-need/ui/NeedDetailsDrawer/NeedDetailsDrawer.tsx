import { ActionIcon, Button, Drawer, Text } from '@mantine/core';
import XIcon from 'shared/assets/icons/x';
import classes from './NeedDetailsDrawer.module.scss';

interface NeedDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  onRespond: () => void;
  needData: {
    title: string;
    description: string;
    tags?: string;
    deadline?: string;
    budget?: number;
  };
}

export const NeedDetailsDrawer = (props: NeedDetailsDrawerProps) => {
  const { opened, onClose, onRespond, needData } = props;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="md"
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
      <div className={classes.drawer}>
        <div className={classes.content}>
          <div className={classes.header}>
            <Text className={classes.title}>{needData.title}</Text>
          </div>

          <div className={classes.description}>{needData.description}</div>

          {needData.tags && (
            <div className={classes.row}>
              <span className={classes.label}>Теги</span>
              <span className={classes.value}>{needData.tags}</span>
            </div>
          )}

          {needData.deadline && (
            <div className={classes.row}>
              <span className={classes.label}>Сроки</span>
              <span className={classes.value}>{needData.deadline}</span>
            </div>
          )}

          {needData.budget && (
            <div className={classes.row}>
              <span className={classes.label}>Бюджет</span>
              <span className={classes.value}>{needData.budget} ₽</span>
            </div>
          )}
        </div>

        <div className={classes.footer}>
          <ActionIcon variant="outline" size={48} radius="16" onClick={onClose}>
            <XIcon />
          </ActionIcon>
          <Button
            radius="xl"
            variant="filled"
            fullWidth
            size="lg"
            onClick={onRespond}
            c="var(--bg-color)"
          >
            Откликнуться
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
