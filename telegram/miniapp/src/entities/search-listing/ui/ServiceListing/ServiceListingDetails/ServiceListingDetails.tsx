import { ActionIcon, Image } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { NeedListingItem } from 'entities/search-listing/ui/NeedListing/NeedListingItem/NeedListingItem';
import { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import CommentIcon from 'shared/assets/icons/comment';
import EyeOpenIcon from 'shared/assets/icons/EyeOpen';
import LikeIcon from 'shared/assets/icons/like';
import MoreIcon from 'shared/assets/icons/more';
import s from './ServiceListingDetails.module.scss';

dayjs.locale('ru');

interface ServiceListingDetailsProps {
  service: SearchServiceItem;
  onClose: () => void;
  onNeedClick?: (id: number) => void;
}

export const ServiceListingDetails = (props: ServiceListingDetailsProps) => {
  const { service, onClose, onNeedClick } = props;

  const needs: SearchNeedItem[] =
    service.needs?.map((need) => ({
      id: need.id,
      name: need.name,
      description: need.description,
      cityName: service.cityId?.toString(),
      publicationName: service.name,
    })) || [];

  const hasImage = !!service.images?.[0];

  return (
    <div className={s.drawer}>
      <div
        className={s.header}
        style={{
          position: hasImage ? 'absolute' : 'relative',
          background: hasImage ? 'transparent' : 'var(--bg-color)',
        }}
      >
        <ActionIcon
          className={s.iconBtn}
          radius="xl"
          size="lg"
          onClick={onClose}
          variant="transparent"
        >
          <ArrowLeftIcon />
        </ActionIcon>
        <ActionIcon
          className={s.iconBtn}
          radius="xl"
          size="lg"
          variant="transparent"
        >
          <MoreIcon />
        </ActionIcon>
      </div>

      {hasImage && (
        <div className={s.imageSection}>
          <div className={s.overlay} />
          <Image
            src={service.images[0].url}
            className={s.image}
            alt={service.name}
          />
          <div className={s.stats}>
            <div className={s.badge}>
              <EyeOpenIcon />
              <span>{service.viewsCount || 0}</span>
            </div>
            <div className={s.badge}>
              <LikeIcon ClassNames={s.icon} />
              <span>{service.likesCount}</span>
            </div>
            <div className={s.badge}>
              <CommentIcon ClassNames={s.icon} />
              <span>{service.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={s.content}
        style={{ marginTop: hasImage ? '-24px' : '0' }}
      >
        <div className={s.date}>
          {dayjs(service.createdAt).format('DD MMMM')}
        </div>

        <h1 className={s.title}>{service.name}</h1>
        <p className={s.description}>{service.description}</p>

        <div className={s.infoRow}>
          <span className={s.label}>Город</span>
          <span className={s.value}>{service.cityId}</span>
        </div>

        {service.tags && service.tags.length > 0 && (
          <div className={s.infoRow}>
            <span className={s.label}>Теги</span>
            <span className={s.value}>
              {service.tags.map((t) => t.name).join(', ')}
            </span>
          </div>
        )}

        {service.coAuthors && service.coAuthors.length > 0 && (
          <div className={s.section}>
            <h3 className={s.sectionTitle}>Команда</h3>
            <div className={s.teamList}>
              {service.coAuthors.map((author) => (
                <div key={author.id} className={s.teamMember}>
                  <img
                    src={author.logo_url || ''}
                    className={s.avatar}
                    alt={author.username}
                  />
                  <div className={s.memberInfo}>
                    <span className={s.memberName}>{author.username}</span>
                    <span className={s.memberRole}>
                      {author.education || 'Участник'}
                    </span>
                  </div>
                </div>
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
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
