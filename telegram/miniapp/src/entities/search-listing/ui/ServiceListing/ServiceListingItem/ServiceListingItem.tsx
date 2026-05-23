import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import s from './ServiceListingItem.module.scss';

interface ServiceListingItemProps {
  service: SearchServiceItem;
  onClick?: (id: number) => void;
}

export const ServiceListingItem = observer((props: ServiceListingItemProps) => {
  const { service, onClick } = props;
  const mainImage = service.topImageUrl;

  useEffect(() => {
    referenceStore.getCitiesAction();
  }, []);

  const cityName =
    referenceStore.cities.find((city) => city.id === service.cityId)?.name ||
    '';

  return (
    <div className={s.container} onClick={() => onClick?.(service.id)}>
      <div className={s.imageSection}>
        {mainImage && (
          <img src={mainImage} className={s.image} alt={service.name} />
        )}
      </div>

      <div className={s.infoSection}>
        <div className={s.authorRow}>
          <div className={s.authorData}></div>
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
