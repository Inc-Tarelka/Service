import { Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Notification } from 'shared/api/service/Notification/types';
import classNames from 'shared/library/ClassNames/classNames';
import { InteractionItem } from '../InteractionItem/InteractionItem';
import s from './InteractionsList.module.scss';

interface InteractionsListProps {
  className?: string;
  notifications: Notification[];
  canEdit?: boolean;
  isLoading?: boolean;
  onItemClick?: () => void;
  onOpenDetail?: (notification: Notification) => void | Promise<void>;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  selectedNotification?: Notification | null;
  isLoadingDetail?: boolean;
}

export const InteractionsList = observer((props: InteractionsListProps) => {
  const {
    className,
    notifications,
    canEdit,
    onItemClick,
    onOpenDetail,
    onDelete,
    isDeleting,
    selectedNotification,
    isLoadingDetail,
  } = props;

  const renderNotification = (notification: Notification) => {
    return (
      <InteractionItem
        key={notification.id}
        notification={notification}
        canEdit={canEdit}
        onClick={onItemClick}
        onOpenDetail={onOpenDetail}
        onDelete={onDelete}
        isDeleting={isDeleting}
        selectedNotification={selectedNotification}
        isLoadingDetail={isLoadingDetail}
      />
    );
  };

  return (
    <Stack gap="sm" className={classNames(s.interactionsList, {}, [className])}>
      {Array.isArray(notifications)
        ? notifications.map(renderNotification)
        : null}
    </Stack>
  );
});

export default InteractionsList;
