import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { ActionsDrawer } from 'entities/interaction';
import { NeedListingItem } from 'entities/search-listing/ui/NeedListing/NeedListingItem/NeedListingItem';
import { TeamMemberItem } from 'entities/search-listing/ui/ServiceListing/TeamMemberItem/TeamMemberItem';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type {
  PublicationNeedDetailed,
  PublicationTeamMember,
} from 'shared/api/service/Publication';
import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import type {
  SearchServiceItem,
  ServiceNeed,
} from 'shared/api/service/PublicationServicesSearch';
import CommentIcon from 'shared/assets/icons/comment';
import EditIcon from 'shared/assets/icons/edit';
import EyeOffIcon from 'shared/assets/icons/EyeOff';
import LikeIcon from 'shared/assets/icons/like';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import ShareIcon from 'shared/assets/icons/share';
import TrashIcon from 'shared/assets/icons/trash';
import XIcon from 'shared/assets/icons/x';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import s from './ServiceListingDetails.module.scss';

dayjs.locale('ru');

interface TeamInviteBanner {
  senderName: string;
  notificationId: number;
  isResponding?: boolean;
  onAccept?: (notificationId: number) => void | Promise<void>;
  onDecline?: (notificationId: number) => void | Promise<void>;
}

interface ServiceListingDetailsProps {
  service: SearchServiceItem;
  cityName?: string;
  team?: PublicationTeamMember[];
  needs?: PublicationNeedDetailed[];
  onNeedClick?: (id: number) => void;
  onCommentClick?: () => void;
  onLike?: (id: number) => void;
  onTeamMemberClick?: (id: number) => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onShare?: (id: number) => void;
  onDeletePublication?: () => void;
  isViewOnly?: boolean;
  teamInviteBanner?: TeamInviteBanner | null;
}

const formatCount = (count: number): string | number => {
  if (count > 99) return '99+';
  return count;
};

const mapNeedToListingItem = (
  need: ServiceNeed | PublicationNeedDetailed,
  publicationName: string,
  cityId?: number,
): SearchNeedItem => ({
  id: need.id,
  name: need.name,
  description: need.description,
  cityName: cityId?.toString(),
  publicationName,
});

export const ServiceListingDetails = observer(
  (props: ServiceListingDetailsProps) => {
    const {
      service,
      cityName,
      team,
      needs,
      onNeedClick,
      onCommentClick,
      onLike,
      onTeamMemberClick,
      isOwner,
      onEdit,
      onShare,
      onDeletePublication,
      isViewOnly = false,
      teamInviteBanner,
    } = props;

    const [actionsDrawerOpened, { open: openActions, close: closeActions }] =
      useDisclosure(false);
    const [deleteDrawerOpened, { open: openDelete, close: closeDelete }] =
      useDisclosure(false);

    const [isLiked, setIsLiked] = useState(service.isLiked ?? false);
    const [likesCount, setLikesCount] = useState(service.likesCount ?? 0);

    useEffect(() => {
      setIsLiked(service.isLiked ?? false);
      setLikesCount(service.likesCount ?? 0);
    }, [service.isLiked, service.likesCount]);

    const handleLikeClick = () => {
      if (isViewOnly) {
        return;
      }

      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));
      onLike?.(service.id);
    };

    const handleCommentClick = () => {
      if (isViewOnly) {
        return;
      }
      onCommentClick?.();
    };

    const handleShareClick = () => {
      onShare?.(service.id);
    };

    const displayNeeds: SearchNeedItem[] = (needs ?? service.needs ?? []).map(
      (need) => mapNeedToListingItem(need, service.name, service.cityId),
    );

    const coAuthors = team ?? [];

    const images =
      service.images && service.images.length > 0
        ? service.images
        : service.topImageUrl
          ? [{ id: 0, url: service.topImageUrl, position: 0 }]
          : [];

    const [activeSlide, setActiveSlide] = useState(0);

    return (
      <div className={s.container}>
        {images.length > 0 && (
          <div className={s.imageSection}>
            <ImageCarousel
              images={images.map((img) => img.url)}
              activeIndex={activeSlide}
              onIndexChange={setActiveSlide}
            />
          </div>
        )}

        <div className={s.infoSection}>
          <div className={s.badgesContainer}>
            <div className={s.badgesLeft}>
              <div
                className={`${s.badge} ${isLiked ? s.likedBadge : ''} ${!isViewOnly ? s.badgeInteractive : s.badgeDisabled}`}
                onClick={!isViewOnly ? handleLikeClick : undefined}
              >
                <div
                  className={`${s.likeIconWrapper} ${isLiked ? s.isLiked : ''}`}
                >
                  <LikeIcon filled={isLiked} />
                </div>
                <div className={s.countContainer}>
                  <div className={s.countScroller}>
                    <span key={likesCount} className={s.countAnimated}>
                      {formatCount(likesCount)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`${s.badge} ${!isViewOnly ? s.badgeInteractive : s.badgeDisabled}`}
                onClick={!isViewOnly ? handleCommentClick : undefined}
              >
                <CommentIcon ClassNames={s.icon} />
                <span className={s.count}>
                  {formatCount(service.commentsCount ?? 0)}
                </span>
              </div>
            </div>
            <div className={s.badgesRight}>
              <div
                className={`${s.iconBtn} ${s.badgeInteractive}`}
                onClick={handleShareClick}
              >
                <ShareIcon />
              </div>
              {isOwner && !isViewOnly && (
                <div className={s.iconBtn} onClick={openActions}>
                  <MoreHorizontalIcon />
                </div>
              )}
            </div>
          </div>

          {isViewOnly && (
            <div className={s.viewOnlyHint}>
              Режим просмотра: лайки, комментарии и переходы в профили
              недоступны.
            </div>
          )}

          <div className={s.topRow}>
            <span className={s.date}>
              {dayjs(service.createdAt).format('DD MMMM')}
            </span>
          </div>

          <div className={s.textSection}>
            <h3 className={s.title}>{service.name}</h3>
            {service.description && (
              <p className={s.description}>{service.description}</p>
            )}
          </div>

          <div className={s.detailsList}>
            {cityName && (
              <div className={s.detailRow}>
                <span className={s.detailLabel}>Город</span>
                <span className={s.detailValue}>{cityName}</span>
              </div>
            )}
            {service.tags && service.tags.length > 0 && (
              <div className={s.detailRowTags}>
                <span className={s.detailLabel}>Теги</span>
                <div className={s.tagsList}>
                  {service.tags.map((tag) => (
                    <span key={tag.id} className={s.tagItem}>
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(teamInviteBanner || coAuthors.length > 0) && (
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Команда</h3>
              <div className={s.teamList}>
                {teamInviteBanner && (
                  <div className={s.teamInviteCard}>
                    <div className={s.teamInviteTitle}>
                      {teamInviteBanner.senderName} хочет отметить вас в проекте
                    </div>
                    <p className={s.teamInviteHint}>
                      Ваш аккаунт не будет отображаться в сокомандниках, пока вы
                      не дадите подтверждение.
                    </p>
                    <div className={s.teamInviteButtons}>
                      <button
                        type="button"
                        className={s.teamInviteDeclineButton}
                        onClick={() =>
                          void teamInviteBanner.onDecline?.(
                            teamInviteBanner.notificationId,
                          )
                        }
                        disabled={teamInviteBanner.isResponding}
                        aria-label="Отклонить приглашение"
                      >
                        <XIcon />
                      </button>
                      <button
                        type="button"
                        className={s.teamInviteAcceptButton}
                        onClick={() =>
                          void teamInviteBanner.onAccept?.(
                            teamInviteBanner.notificationId,
                          )
                        }
                        disabled={teamInviteBanner.isResponding}
                      >
                        Согласен
                      </button>
                    </div>
                  </div>
                )}
                {coAuthors.map((author) => (
                  <TeamMemberItem
                    key={author.userId}
                    member={author}
                    isAuthor={author.isAuthor}
                    onClick={!isViewOnly ? onTeamMemberClick : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {displayNeeds.length > 0 && (
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Потребности</h3>
              <div className={s.needsList}>
                {displayNeeds.map((need) => (
                  <NeedListingItem
                    key={need.id}
                    need={need}
                    onClick={!isViewOnly ? onNeedClick : undefined}
                    hideProjectAndCity
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <ActionsDrawer
          opened={actionsDrawerOpened}
          onClose={closeActions}
          noTitle
          size={isOwner ? 185 : 80}
          actions={[
            ...(isOwner
              ? [
                  {
                    label: 'Редактировать',
                    icon: <EditIcon />,
                    onClick: () => {
                      closeActions();
                      onEdit?.();
                    },
                  },
                  {
                    label: 'Скрыть из профиля',
                    icon: <EyeOffIcon />,
                    onClick: () => {
                      closeActions();
                    },
                  },
                  {
                    label: 'Удалить',
                    icon: <TrashIcon color="var(--red)" />,
                    variant: 'danger' as const,
                    onClick: () => {
                      closeActions();
                      openDelete();
                    },
                  },
                ]
              : []),
          ]}
        />

        <ActionsDrawer
          opened={deleteDrawerOpened}
          onClose={closeDelete}
          title="Вы уверены, что хотите удалить проект?"
          onDelete={() => {
            closeDelete();
            onDeletePublication?.();
          }}
        />
      </div>
    );
  },
);
