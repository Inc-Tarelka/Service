import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { ServiceListingItem } from '../ServiceListingItem/ServiceListingItem';
import { ServiceListingSkeleton } from '../ServiceListingSkeleton/ServiceListingSkeleton';
import classes from './ServiceListingList.module.scss';

interface ServiceListingListProps {
  services: SearchServiceItem[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const ServiceListingList = (props: ServiceListingListProps) => {
  const { services, onItemClick, isLoading } = props;

  if (isLoading) {
    return (
      <div className={classes.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className={classes.empty}>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={classes.grid}>
      {services.map((service) => (
        <ServiceListingItem
          key={service.id}
          service={service}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
