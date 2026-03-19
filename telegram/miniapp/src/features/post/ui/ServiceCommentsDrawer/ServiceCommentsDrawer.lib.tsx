import { Divider } from '@mantine/core';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import type { PublicationComment } from 'shared/api/service/Publication/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import ChevronUpIcon from 'shared/assets/icons/chevronUp';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import s from './ServiceCommentsDrawer.module.scss';

interface CommentItemProps {
  comment: PublicationComment;
  isReply: boolean;
  replyingToName?: string;
  onMoreClick: (id: number) => void;
}

export const CommentItem = (props: CommentItemProps) => {
  const { comment, isReply, replyingToName, onMoreClick } = props;
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

interface CommentThreadItemProps {
  rootComment: PublicationComment;
  allComments: PublicationComment[];
  onMoreClick: (id: number) => void;
}

export const CommentThreadItem = observer((props: CommentThreadItemProps) => {
  const { rootComment, allComments, onMoreClick } = props;
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
      <CommentItem
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
              <CommentItem
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
});
