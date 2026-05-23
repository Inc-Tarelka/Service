import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { ServiceListingItem } from '../ServiceListingItem/ServiceListingItem';
import { ServiceListingSkeleton } from '../ServiceListingSkeleton/ServiceListingSkeleton';
import classes from './ServiceListingList.module.scss';

interface ServiceListingListProps {
  services: SearchServiceItem[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

export const ServiceListingList = (props: ServiceListingListProps) => {
  const { services, onItemClick, isLoading, isLoadingMore } = props;

  if (isLoading && services.length === 0) {
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
      {isLoadingMore && (
        <div className={classes.loadMore}>
          {Array.from({ length: 2 }).map((_, index) => (
            <ServiceListingSkeleton key={`more-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};
