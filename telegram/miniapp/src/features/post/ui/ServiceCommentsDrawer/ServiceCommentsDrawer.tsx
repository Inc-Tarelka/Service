import { Divider, Drawer, Text, Textarea } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { ActionItem } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { ActionsDrawer } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import type { PublicationComment } from 'shared/api/service/Publication/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import ChevronUpIcon from 'shared/assets/icons/chevronUp';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import SendIcon from 'shared/assets/icons/send';
import ShareIcon from 'shared/assets/icons/share';
import WarningIcon from 'shared/assets/icons/warning';
import XIcon from 'shared/assets/icons/x';
import s from './ServiceCommentsDrawer.module.scss';

dayjs.locale('ru');

interface ServiceCommentsDrawerProps {
  opened: boolean;
  onClose: () => void;
  publicationId: number;
}

const CommentItemComponent = ({
  comment,
  isReply,
  replyingToName,
  onMoreClick,
}: {
  comment: PublicationComment;
  isReply: boolean;
  replyingToName?: string;
  onMoreClick: (id: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.content.length > 150;

  return (
    <div className={`${s.commentItem} ${isReply ? s.isReply : ''}`}>
      <div className={s.commentContent}>
        <div className={s.commentHeader}>
          <div className={s.authorInfo}>
            <div className={s.nameRow}>
              <span className={s.authorName}>
                {comment.authorFirstName} {comment.authorLastName}
              </span>
              <span className={s.time}>
                {dayjs(comment.createdAt).format('DD MMM, HH:mm')}
              </span>
            </div>
            {replyingToName && (
              <span className={s.replyingToName}>в ответ {replyingToName}</span>
            )}
          </div>
        </div>
        <div className={s.text}>
          {isLong && !expanded
            ? `${comment.content.slice(0, 150)}... `
            : comment.content}
          {isLong && !expanded && (
            <button
              type="button"
              className={s.readMoreBtn}
              onClick={() => setExpanded(true)}
            >
              развернуть
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className={s.moreButton}
        onClick={() => onMoreClick(comment.id)}
      >
        <span className={s.moreDots}>
          <MoreHorizontalIcon />
        </span>
      </button>
    </div>
  );
};

const CommentThreadItem = observer(
  ({
    rootComment,
    allComments,
    onMoreClick,
  }: {
    rootComment: PublicationComment;
    allComments: PublicationComment[];
    onMoreClick: (id: number) => void;
  }) => {
    const [visibleCount, setVisibleCount] = useState(0);

    const descendants = useMemo(() => {
      const getDescendants = (parentId: number): PublicationComment[] => {
        const children = allComments.filter(
          (c) => c.parentCommentId === parentId,
        );
        let result = [...children];
        children.forEach((child) => {
          result = result.concat(getDescendants(child.id));
        });
        return result;
      };
      return getDescendants(rootComment.id).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }, [rootComment.id, allComments]);

    const handleShowMore = () => {
      setVisibleCount((prev) => Math.min(prev + 5, descendants.length));
    };

    const handleCollapse = () => {
      setVisibleCount(0);
    };

    const visibleReplies = descendants.slice(0, visibleCount);
    const remainingCount = descendants.length - visibleCount;

    return (
      <div key={rootComment.id} className={s.commentGroup}>
        <CommentItemComponent
          comment={rootComment}
          isReply={false}
          onMoreClick={onMoreClick}
        />

        {descendants.length > 0 && (
          <div className={s.repliesList}>
            {visibleReplies.map((reply) => {
              const parentComment = allComments.find(
                (c) => c.id === reply.parentCommentId,
              );
              const isReplyToReply =
                parentComment && parentComment.id !== rootComment.id;
              const replyingToName = isReplyToReply
                ? `${parentComment.authorFirstName} ${parentComment.authorLastName}`
                : undefined;

              return (
                <CommentItemComponent
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  replyingToName={replyingToName}
                  onMoreClick={onMoreClick}
                />
              );
            })}

            {(remainingCount > 0 || visibleCount > 0) && (
              <div className={s.paginationRow}>
                {remainingCount > 0 ? (
                  <button
                    type="button"
                    className={s.showRepliesBtn}
                    onClick={handleShowMore}
                  >
                    <Divider className={s.replyLine} />
                    <span>Посмотреть еще {remainingCount}</span>
                    <ChevronDownIcon />
                  </button>
                ) : (
                  <span className={s.placeholder} />
                )}

                {visibleCount > 0 && descendants.length > 0 && (
                  <button
                    type="button"
                    className={s.hideRepliesBtn}
                    onClick={handleCollapse}
                  >
                    <span>Скрыть</span>
                    <ChevronUpIcon />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

export const ServiceCommentsDrawer = observer(
  (props: ServiceCommentsDrawerProps) => {
    const { opened, onClose, publicationId } = props;
    const { publicationCommentsStore } = useStore();

    const [avatarDrawerOpened, setAvatarDrawerOpened] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
      null,
    );
    const [commentText, setCommentText] = useState('');
    const [replyToId, setReplyToId] = useState<number | null>(null);

    useEffect(() => {
      if (opened) {
        publicationCommentsStore.getCommentsAction(publicationId);
      }
    }, [opened, publicationId, publicationCommentsStore]);

    const rawComments = publicationCommentsStore.getComments(publicationId);
    const totalComments =
      publicationCommentsStore.totalByPublication[publicationId] || 0;
    const isLoading =
      publicationCommentsStore.isLoadingByPublication[publicationId] || false;

    const rootComments = useMemo(() => {
      return rawComments.filter((c: PublicationComment) => !c.parentCommentId);
    }, [rawComments]);

    const handleAvatarAction = (action: string) => {
      const commentId = selectedCommentId;
      setAvatarDrawerOpened(false);
      setSelectedCommentId(null);
      if (action === 'reply' && commentId) {
        setReplyToId(commentId);
      }
    };

    const handleSend = () => {
      if (!commentText.trim()) return;
      publicationCommentsStore.createCommentAction(
        publicationId,
        commentText.trim(),
        replyToId || undefined,
      );
      setCommentText('');
      setReplyToId(null);
    };

    const DotsAction: ActionItem[] = [
      {
        label: 'Ответить',
        icon: <ShareIcon />,
        onClick: () => handleAvatarAction('reply'),
      },
      {
        label: 'Пожаловаться',
        icon: <WarningIcon color="var(--red)" />,
        variant: 'danger',
        onClick: () => handleAvatarAction('warn'),
      },
    ];

    const replyToComment = rawComments.find(
      (c: PublicationComment) => c.id === replyToId,
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
            <Text className={s.title}>Комментарии ({totalComments})</Text>
            <button type="button" className={s.closeButton} onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <div className={s.commentList}>
            {isLoading && rawComments.length === 0 ? (
              <div className={s.emptyState}>Загрузка...</div>
            ) : rootComments.length > 0 ? (
              rootComments.map((rootComment) => (
                <CommentThreadItem
                  key={rootComment.id}
                  rootComment={rootComment}
                  allComments={rawComments}
                  onMoreClick={(id) => {
                    setSelectedCommentId(id);
                    setAvatarDrawerOpened(true);
                  }}
                />
              ))
            ) : (
              <div className={s.emptyState}>Нет комментариев</div>
            )}
          </div>

          <div className={s.footerContainer}>
            {replyToId && replyToComment && (
              <div className={s.replyingTo}>
                <div className={s.replyingToContent}>
                  <span className={s.replyingToLabel}>
                    В ответ {replyToComment.authorFirstName}{' '}
                    {replyToComment.authorLastName}
                  </span>
                  <p className={s.replyingToText}>{replyToComment.content}</p>
                </div>
                <button
                  type="button"
                  className={s.cancelReplyButton}
                  onClick={() => setReplyToId(null)}
                >
                  <XIcon />
                </button>
              </div>
            )}
            <div className={s.footer}>
              <Textarea
                className={s.input}
                placeholder="Комментарий"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autosize
                minRows={1}
                maxRows={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                classNames={{ input: s.textareaInput }}
              />
              <button
                type="button"
                className={s.sendIcon}
                onClick={handleSend}
                disabled={!commentText.trim()}
              >
                <SendIcon />
              </button>
            </div>
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
  },
);
