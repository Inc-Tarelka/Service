import { Button, Drawer, Stack, Text } from '@mantine/core';
import classNames from 'shared/library/ClassNames/classNames';
import s from './ActionsDrawer.module.scss';

interface ActionsDrawerProps {
  opened: boolean;
  onClose: () => void;
  onDelete?: () => void;
  title?: string;
  fullWidth?: boolean;
}

export const ActionsDrawer = (props: ActionsDrawerProps) => {
  const { opened, onClose, onDelete, title = 'Вы уверены?', fullWidth } = props;
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
        <Text
          className={classNames(
            s.title,
            {
              [s.fullWidth]: fullWidth,
            },
            [],
          )}
        >
          {title}
        </Text>

        <Stack gap={12}>
          <Button
            fullWidth
            radius="xl"
            size="lg"
            color={'var(--red)'}
            onClick={handleDelete}
            notDark
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
