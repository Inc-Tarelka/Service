import { Drawer, Text } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { ActionItem } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { ActionsDrawer } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { useState } from 'react';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import SendIcon from 'shared/assets/icons/send';
import ShareIcon from 'shared/assets/icons/share';
import WarningIcon from 'shared/assets/icons/warning';
import XIcon from 'shared/assets/icons/x';
import type { MockComment } from 'shared/mocks/serviceDetailMocks';
import s from './ServiceCommentsDrawer.module.scss';

dayjs.locale('ru');

interface ServiceCommentsDrawerProps {
  opened: boolean;
  onClose: () => void;
  comments: MockComment[];
}

export const ServiceCommentsDrawer = (props: ServiceCommentsDrawerProps) => {
  const { opened, onClose, comments } = props;

  const [avatarDrawerOpened, setAvatarDrawerOpened] = useState(false);

  const handleAvatarAction = (_action: string) => {
    setAvatarDrawerOpened(false);
  };

  const DotsAction: ActionItem[] = [
    {
      label: 'Ответить',
      icon: <ShareIcon />,
      onClick: () => handleAvatarAction('share'),
    },
    {
      label: 'Пожаловаться',
      icon: <WarningIcon color="var(--red)" />,
      variant: 'danger',
      onClick: () => handleAvatarAction('warn'),
    },
  ];

  const renderComment = (comment: MockComment, isReply = false) => (
    <div
      key={comment.id}
      className={`${s.commentItem} ${isReply ? s.isReply : ''}`}
    >
      <div className={s.commentContent}>
        <div className={s.commentHeader}>
          <span className={s.authorName}>
            {comment.firstName} {comment.lastName}
          </span>
          <span className={s.time}>
            {dayjs(comment.createdAt).format('DD MMM, HH:mm')}
          </span>
        </div>
        <p className={s.text}>{comment.text}</p>
      </div>
      <button
        type="button"
        className={s.moreButton}
        onClick={() => setAvatarDrawerOpened(true)}
      >
        <span className={s.moreDots}>
          <MoreHorizontalIcon />
        </span>
      </button>
    </div>
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      withCloseButton={false}
      classNames={{
        body: s.body,
        content: 'drawer-fulldevice',
      }}
    >
      <div className={s.drawer}>
        <div className={s.header}>
          <Text className={s.title}>Комментарии ({comments.length})</Text>
          <button type="button" className={s.closeButton} onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className={s.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={s.commentGroup}>
              {renderComment(comment)}
              {comment.replies && comment.replies.length > 0 && (
                <div className={s.repliesList}>
                  {comment.replies.map((reply) => renderComment(reply, true))}
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <div className={s.emptyState}>Нет комментариев</div>
          )}
        </div>

        <div className={s.footer}>
          <input type="text" className={s.input} placeholder="Комментарий" />
          <button type="button" className={s.sendIcon}>
            <SendIcon />
          </button>
        </div>
      </div>

      <ActionsDrawer
        opened={avatarDrawerOpened}
        onClose={() => setAvatarDrawerOpened(false)}
        actions={DotsAction}
        noTitle
      />
    </Drawer>
  );
};
