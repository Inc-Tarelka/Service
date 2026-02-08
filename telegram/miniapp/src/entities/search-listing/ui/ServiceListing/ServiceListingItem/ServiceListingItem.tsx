import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import EyeOpenIcon from 'shared/assets/icons/EyeOpen';
import LikeIcon from 'shared/assets/icons/like';
import s from './ServiceListingItem.module.scss';

interface ServiceListingItemProps {
  service: SearchServiceItem;
  onClick?: (id: number) => void;
}

export const ServiceListingItem = (props: ServiceListingItemProps) => {
  const { service, onClick } = props;
  const mainImage = service.images?.[0]?.url;

  const author = service.coAuthors?.[0] || { username: 'Автор' };

  return (
    <div
      className={s.container}
      onClick={() => onClick?.(service.id)}
      style={{
        backgroundImage: mainImage ? `url(${mainImage})` : undefined,
      }}
    >
      <div className={s.overlay} />

      <div className={s.badges}>
        <div className={s.badge}>
          <LikeIcon ClassNames={s.icon} />
          <span>{service.likesCount}</span>
        </div>
        <div className={s.badge}>
          <EyeOpenIcon />
          <span>{service.viewsCount || 0}</span>
        </div>
      </div>

      <div className={s.content}>
        <div className={s.userInfo}>
          <div className={s.authorBlock}>
            <span className={s.authorName}>{author.username}</span>
            <span className={s.username}>@{author.username}</span>
          </div>
          <span className={s.city}>{service.cityId}</span>
        </div>

        <h3 className={s.title}>{service.name}</h3>

        {service.description && (
          <p className={s.description}>{service.description}</p>
        )}
      </div>
    </div>
  );
};
