import { ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { Notification } from 'shared/api/service/Notification/types';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { CollaborationRequestDrawer } from '../CollaborationRequestDrawer/CollaborationRequestDrawer';
import { OfferDetailsDrawer } from '../OfferDetailsDrawer/OfferDetailsDrawer';
import classes from './InteractionItem.module.scss';

interface InteractionItemProps {
  notification: Notification;
  canEdit?: boolean;
  onClick?: () => void;
  onOpenDetail?: (notification: Notification) => void | Promise<void>;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  selectedNotification?: Notification | null;
  isLoadingDetail?: boolean;
}

export const InteractionItem = (props: InteractionItemProps) => {
  const {
    notification,
    canEdit,
    onClick,
    onOpenDetail,
    onDelete,
    isDeleting,
    selectedNotification,
    isLoadingDetail,
  } = props;
  const [isDetailOpen, setDetailOpen] = useState(false);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailOpen(true);
    void onOpenDetail?.(notification);
  };

  const handleCardClick = () => {
    setDetailOpen(true);
    onClick?.();
    void onOpenDetail?.(notification);
  };

  const isOffer = notification.type === 'Response';
  const detailNotification =
    selectedNotification?.id === notification.id
      ? selectedNotification
      : notification;
  const isDetailLoading =
    Boolean(isDetailOpen) &&
    selectedNotification?.id === notification.id &&
    Boolean(isLoadingDetail);

  return (
    <>
      <div className={classes.card} onClick={handleCardClick}>
        <div className={classes.header}>
          <span className={classes.title}>
            {isOffer ? 'Отклик на потребность' : 'Запрос на сотрудничество'}
          </span>
          {canEdit && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={handleChevronClick}
            >
              <ChevronRightIcon className={classes.chevron} />
            </ActionIcon>
          )}
        </div>

        <p className={classes.description}>{notification.message}</p>
      </div>

      {isOffer ? (
        <OfferDetailsDrawer
          opened={isDetailOpen}
          onClose={() => setDetailOpen(false)}
          notification={detailNotification}
          onDelete={onDelete}
          isDeleting={isDeleting}
          isLoading={isDetailLoading}
        />
      ) : (
        <CollaborationRequestDrawer
          opened={isDetailOpen}
          onClose={() => setDetailOpen(false)}
          notification={detailNotification}
          onDelete={onDelete}
          isDeleting={isDeleting}
          isLoading={isDetailLoading}
        />
      )}
    </>
  );
};
