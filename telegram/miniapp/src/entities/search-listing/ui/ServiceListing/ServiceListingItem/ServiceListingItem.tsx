import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import LikeIcon from 'shared/assets/icons/like';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import s from './ServiceListingItem.module.scss';

interface ServiceListingItemProps {
  service: SearchServiceItem;
  onClick?: (id: number) => void;
}

export const ServiceListingItem = observer((props: ServiceListingItemProps) => {
  const { service, onClick } = props;
  const mainImage = service.topImageUrl;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(service.likesCount);

  useEffect(() => {
    referenceStore.getCitiesAction();
  }, []);

  const cityName =
    referenceStore.cities.find((city) => city.id === service.cityId)?.name ||
    '';

  const firstName = 'Иван';
  const lastName = 'Иванов';
  const username = 'nick_name';

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const formatCount = (count: number) => {
    if (count > 99) return '99+';
    return count;
  };

  return (
    <div className={s.container} onClick={() => onClick?.(service.id)}>
      <div className={s.imageSection}>
        {mainImage && (
          <img src={mainImage} className={s.image} alt={service.name} />
        )}

        <div className={s.badges}>
          <div
            className={s.badge}
            onClick={handleLikeClick}
            style={{ cursor: 'pointer' }}
          >
            <LikeIcon ClassNames={`${s.icon} ${isLiked ? s.filled : ''}`} />
            <span
              className={`${s.count} ${likesCount > 0 ? s.countVisible : ''}`}
            >
              {formatCount(likesCount)}
            </span>
          </div>
        </div>
      </div>

      <div className={s.infoSection}>
        <div className={s.authorRow}>
          <div className={s.authorData}>
            <span className={s.authorName}>
              {firstName} {lastName}
            </span>
            <span className={s.authorUsername}>@{username}</span>
          </div>
          <div className={s.locationAndTags}>
            <span className={s.city}>{cityName}</span>
            {service.tags && service.tags.length > 0 && (
              <div className={s.tagsList}>
                {service.tags.map((tag) => (
                  <span key={tag.id} className={s.tagItem}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={s.textSection}>
          <h3 className={s.title}>{service.name}</h3>
          {service.description && (
            <p className={s.description}>{service.description}</p>
          )}
        </div>
      </div>
    </div>
  );
});
