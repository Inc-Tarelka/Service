import { Button, Drawer, Stack, Text } from '@mantine/core';
import classes from './ActionsDrawer.module.scss';

interface ActionsDrawerProps {
  opened: boolean;
  onClose: () => void;
  onDelete?: () => void;
  title?: string;
}

export const ActionsDrawer = ({
  opened,
  onClose,
  onDelete,
  title = 'Вы уверены, что хотите удалить запрос на сотрудничество?',
}: ActionsDrawerProps) => {
  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size={230}
      withCloseButton={false}
      padding={24}
      radius={40}
    >
      <Stack gap={24}>
        <Text className={classes.title}>{title}</Text>

        <Stack gap={12}>
          <Button
            fullWidth
            radius="xl"
            size="lg"
            color={'var(--red)'}
            onClick={handleDelete}
          >
            Удалить
          </Button>

          <Button
            variant="outline"
            fullWidth
            radius="xl"
            size="lg"
            onClick={onClose}
          >
            Отмена
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};
