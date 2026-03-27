import { Button, Drawer, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';
import classNames from 'shared/library/ClassNames/classNames';
import s from './ActionsDrawer.module.scss';

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionsDrawerProps {
  opened: boolean;
  onClose: () => void;
  onDelete?: () => void;
  title?: string;
  confirmLabel?: string;
  noTitle?: boolean;
  fullWidth?: boolean;
  actions?: ActionItem[];
  size?: number | string;
}

export const ActionsDrawer = (props: ActionsDrawerProps) => {
  const {
    opened,
    onClose,
    onDelete,
    title = 'Вы уверены?',
    confirmLabel = 'Удалить',
    noTitle,
    fullWidth,
    actions,
    size,
  } = props;
  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size={
        size !== undefined
          ? size
          : actions
            ? noTitle
              ? 130
              : 180
            : noTitle
              ? 180
              : 230
      }
      withCloseButton={false}
      padding={24}
      radius={40}
    >
      <Stack gap={24}>
        {!noTitle && (
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
        )}

        {actions ? (
          <Stack gap={24}>
            {actions.map((action, index) => (
              <button
                key={index}
                className={classNames(s.actionItem, {
                  [s.danger]: action.variant === 'danger',
                })}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
              >
                {action.icon && <span className={s.icon}>{action.icon}</span>}
                <span className={s.label}>{action.label}</span>
              </button>
            ))}
          </Stack>
        ) : (
          <Stack gap={12}>
            <Button
              fullWidth
              radius="xl"
              size="lg"
              color={'var(--red)'}
              onClick={handleDelete}
              notDark
            >
              {confirmLabel}
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
        )}
      </Stack>
    </Drawer>
  );
};
