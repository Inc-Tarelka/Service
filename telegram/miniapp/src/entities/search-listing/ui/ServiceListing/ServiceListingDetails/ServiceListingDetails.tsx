import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
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
import EyeOpenIcon from 'shared/assets/icons/EyeOpen';
import LikeIcon from 'shared/assets/icons/like';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import ShareIcon from 'shared/assets/icons/share';
import TrashIcon from 'shared/assets/icons/trash';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import s from './ServiceListingDetails.module.scss';

dayjs.locale('ru');

interface ServiceListingDetailsProps {
  service: SearchServiceItem;
  cityName?: string;
  team?: PublicationTeamMember[];
  needs?: PublicationNeedDetailed[];
  onNeedClick?: (id: number) => void;
  onCommentClick?: () => void;
  onLike?: (id: number) => void;
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

    const debouncedLike = useDebouncedCallback((id: number) => {
      onLike?.(id);
    }, 1000);

    const handleLikeClick = () => {
      const nextLiked = !isLiked;
      setIsLiked(nextLiked);
      setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));
      debouncedLike(service.id);
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
              <div className={s.badge}>
                <EyeOpenIcon />
                <span className={s.count}>
                  {formatCount(service.viewsCount ?? 0)}
                </span>
              </div>

              <div
                className={`${s.badge} ${isLiked ? s.likedBadge : ''}`}
                onClick={handleLikeClick}
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

              <div className={s.badge} onClick={onCommentClick}>
                <CommentIcon ClassNames={s.icon} />
                <span className={s.count}>
                  {formatCount(service.commentsCount ?? 0)}
                </span>
              </div>
            </div>
            <div className={s.badgesRight}>
              <div className={s.iconBtn}>
                <ShareIcon />
              </div>
              <div className={s.iconBtn} onClick={openActions}>
                <MoreHorizontalIcon />
              </div>
            </div>
          </div>

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

          {coAuthors.length > 0 && (
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Команда</h3>
              <div className={s.teamList}>
                {coAuthors.map((author) => (
                  <TeamMemberItem
                    key={author.userId}
                    member={author}
                    isAuthor={author.isAuthor}
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
                    onClick={onNeedClick}
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
          size={130}
          actions={[
            {
              label: 'Редактировать',
              icon: <EditIcon />,
              onClick: () => {},
            },
            {
              label: 'Удалить',
              icon: <TrashIcon color="var(--red)" />,
              variant: 'danger',
              onClick: () => {
                closeActions();
                openDelete();
              },
            },
          ]}
        />

        <ActionsDrawer
          opened={deleteDrawerOpened}
          onClose={closeDelete}
          title="Вы уверены, что хотите удалить проект?"
          onDelete={() => {
            closeDelete();
          }}
        />
      </div>
    );
  },
);
