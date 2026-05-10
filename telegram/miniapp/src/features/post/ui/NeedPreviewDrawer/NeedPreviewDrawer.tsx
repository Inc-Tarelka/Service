import { ActionIcon, Button, Drawer, Text } from '@mantine/core';
import { PostNeed } from 'shared/api/service/Post/types';
import EditIcon from 'shared/assets/icons/edit';
import XIcon from 'shared/assets/icons/x';
import classes from './NeedPreviewDrawer.module.scss';

interface NeedPreviewDrawerProps {
  opened: boolean;
  onClose: () => void;
  onEdit: () => void;
  need: PostNeed | null;
  tagsData: { value: string; label: string }[];
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const NeedPreviewDrawer = (props: NeedPreviewDrawerProps) => {
  const { opened, onClose, onEdit, need, tagsData } = props;

  const getTagName = (id: string) => {
    return tagsData.find((t) => t.value === id)?.label || id;
  };

  const tagsString = need?.tagIds?.map(getTagName).join(', ');
  const dateString =
    need?.startDate && need?.endDate
      ? `${formatDate(need.startDate)} - ${formatDate(need.endDate)}`
      : '';

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="lg"
      withCloseButton={false}
      styles={{
        body: { padding: 0, height: '100%' },
      }}
    >
      <div className={classes.drawer}>
        <div className={classes.header}>
          <Text className={classes.title}>{need?.title}</Text>
          <button
            type="button"
            className={classes.closeButtonHeader}
            onClick={onClose}
          >
            <XIcon />
          </button>
        </div>

        <div className={classes.content}>
          <div className={classes.description}>{need?.description}</div>

          {tagsString && (
            <div className={classes.row}>
              <span className={classes.label}>Теги</span>
              <span className={classes.value}>{tagsString}</span>
            </div>
          )}

          {dateString && (
            <div className={classes.row}>
              <span className={classes.label}>Сроки</span>
              <span className={classes.value}>{dateString}</span>
            </div>
          )}

          {need?.budget && (
            <div className={classes.row}>
              <span className={classes.label}>Бюджет</span>
              <span className={classes.value}>{need.budget} ₽</span>
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
            bg="var(--green)"
            c="var(--bg-color)"
            onClick={onClose}
          >
            Закрыть потребность
          </Button>
          <ActionIcon variant="outline" size={48} radius="16" onClick={onEdit}>
            <EditIcon />
          </ActionIcon>
        </div>
      </div>
    </Drawer>
  );
};
