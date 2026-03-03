import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { ActionsDrawer } from 'entities/interaction';
import { NeedListingItem } from 'entities/search-listing/ui/NeedListing/NeedListingItem/NeedListingItem';
import { TeamMemberItem } from 'entities/search-listing/ui/ServiceListing/TeamMemberItem/TeamMemberItem';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import CommentIcon from 'shared/assets/icons/comment';
import EditIcon from 'shared/assets/icons/edit';
import EyeOpenIcon from 'shared/assets/icons/EyeOpen';
import LikeIcon from 'shared/assets/icons/like';
import MoreHorizontalIcon from 'shared/assets/icons/MoreHorizontalIcon';
import ShareIcon from 'shared/assets/icons/share';
import TrashIcon from 'shared/assets/icons/trash';
import {
  MOCK_CITY_MAP,
  MOCK_SERVICE_DETAIL,
} from 'shared/mocks/serviceDetailMocks';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import s from './ServiceListingDetails.module.scss';

dayjs.locale('ru');

interface ServiceListingDetailsProps {
  service: SearchServiceItem;
  onNeedClick?: (id: number) => void;
  onCommentClick?: () => void;
  onLikeClick?: () => void;
}

export const ServiceListingDetails = observer(
  (props: ServiceListingDetailsProps) => {
    const { service, onNeedClick, onCommentClick, onLikeClick } = props;

    const [actionsDrawerOpened, { open: openActions, close: closeActions }] =
      useDisclosure(false);
    const [deleteDrawerOpened, { open: openDelete, close: closeDelete }] =
      useDisclosure(false);

    useEffect(() => {
      referenceStore.getCitiesAction();
    }, []);

    const cityName =
      referenceStore.cities.find((city) => city.id === service.cityId)?.name ||
      MOCK_CITY_MAP[service.cityId] ||
      service.cityId;

    const rawNeeds =
      service.needs && service.needs.length > 0
        ? service.needs
        : MOCK_SERVICE_DETAIL.needs;

    const needs: SearchNeedItem[] =
      rawNeeds?.map((need: any) => ({
        id: need.id,
        name: need.name,
        description: need.description,
        cityName: service.cityId?.toString(),
        publicationName: service.name,
      })) || [];

    const coAuthors =
      service.coAuthors && service.coAuthors.length > 0
        ? service.coAuthors
        : MOCK_SERVICE_DETAIL.coAuthors;

    const images =
      service.images && service.images.length > 0
        ? [
            ...service.images,
            {
              id: 991,
              url: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              position: 1,
            },
            {
              id: 992,
              url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              position: 2,
            },
          ]
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
                  {(service.viewsCount ?? 0) > 99
                    ? '99+'
                    : (service.viewsCount ?? 0)}
                </span>
              </div>
              <div
                className={s.badge}
                onClick={onLikeClick}
                style={{ cursor: 'pointer' }}
              >
                <LikeIcon ClassNames={s.icon} />
                <span className={s.count}>{service.likesCount || 0}</span>
              </div>
              <div
                className={s.badge}
                onClick={onCommentClick}
                style={{ cursor: 'pointer' }}
              >
                <CommentIcon ClassNames={s.icon} />
                <span className={s.count}>{service.commentsCount || 0}</span>
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

          {coAuthors && coAuthors.length > 0 && (
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Команда</h3>
              <div className={s.teamList}>
                {coAuthors.map((author: any, index: number) => (
                  <TeamMemberItem
                    key={author.id}
                    member={author}
                    isAuthor={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {needs.length > 0 && (
            <div className={s.section}>
              <h3 className={s.sectionTitle}>Потребности</h3>
              <div className={s.needsList}>
                {needs.map((need) => (
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
