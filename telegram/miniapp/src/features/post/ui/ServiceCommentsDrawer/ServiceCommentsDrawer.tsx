import { Drawer, Textarea } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import 'dayjs/locale/ru';
import type { ActionItem } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { ActionsDrawer } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { AnimatePresence, motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicationComment } from 'shared/api/service/Publication/types';
import SendIcon from 'shared/assets/icons/send';
import ShareIcon from 'shared/assets/icons/share';
import WarningIcon from 'shared/assets/icons/warning';
import XIcon from 'shared/assets/icons/x';
import s from './ServiceCommentsDrawer.module.scss';
import { CommentThreadItem } from './ServiceCommentsDrawer.lib';

interface ServiceCommentsDrawerProps {
  opened: boolean;
  onClose: () => void;
  publicationId: number;
}

export const ServiceCommentsDrawer = observer(
  (props: ServiceCommentsDrawerProps) => {
    const { opened, onClose, publicationId } = props;
    const { publicationCommentsStore } = useStore();

    const [avatarDrawerOpened, setAvatarDrawerOpened] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
      null,
    );
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<PublicationComment | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        const comment = rawComments.find((c) => c.id === commentId);
        if (comment) {
          setReplyTo(comment);
          setTimeout(() => textareaRef.current?.focus(), 100);
        }
      }
    };

    const handleSend = () => {
      if (!commentText.trim()) return;
      publicationCommentsStore.createCommentAction(
        publicationId,
        commentText.trim(),
        replyTo?.id || undefined,
      );
      setCommentText('');
      setReplyTo(null);
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
            <span className={s.title}>Комментарии ({totalComments})</span>
            <button type="button" className={s.closeButton} onClick={onClose}>
              <XIcon />
            </button>
          </div>

          <div className={s.commentList}>
            {isLoading && rawComments.length === 0 ? (
              <div className={s.emptyState}>Загрузка...</div>
            ) : rootComments.length > 0 ? (
              <>
                {rootComments.map((rootComment) => (
                  <CommentThreadItem
                    key={rootComment.id}
                    rootComment={rootComment}
                    allComments={rawComments}
                    onMoreClick={(id) => {
                      setSelectedCommentId(id);
                      setAvatarDrawerOpened(true);
                    }}
                  />
                ))}
                <div className={s.listBottomSpacer} />
              </>
            ) : (
              <div className={s.emptyState}>Нет комментариев</div>
            )}
          </div>

          <div className={s.footerContainer}>
            <div className={s.inputBox}>
              <AnimatePresence>
                {replyTo && (
                  <motion.div
                    className={s.replyPreview}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={s.replyPreviewInner}>
                      <div className={s.replyAccentBar} />
                      <div className={s.replyPreviewContent}>
                        <span className={s.replyPreviewName}>
                          {replyTo.authorFirstName} {replyTo.authorLastName}
                        </span>
                        <p className={s.replyPreviewText}>{replyTo.content}</p>
                      </div>
                      <button
                        type="button"
                        className={s.cancelReplyButton}
                        onClick={() => setReplyTo(null)}
                      >
                        <XIcon />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={s.footer}>
                <Textarea
                  ref={textareaRef}
                  placeholder="Комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  autosize
                  minRows={1}
                  maxRows={6}
                  classNames={{
                    root: s.textareaRoot,
                    wrapper: s.textareaWrapper,
                    input: s.textareaInput,
                  }}
                />
                <button
                  type="button"
                  className={`${s.sendButton} ${commentText.trim() ? s.sendButtonActive : ''}`}
                  onClick={handleSend}
                  disabled={!commentText.trim()}
                >
                  <SendIcon />
                </button>
              </div>
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
