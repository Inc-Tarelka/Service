import type { SearchPublication } from 'shared/api/service/Publication';
import { ServiceListingItem } from '../ServiceListingItem/ServiceListingItem';
import { ServiceListingSkeleton } from '../ServiceListingSkeleton/ServiceListingSkeleton';
import classes from './ServiceListingList.module.scss';

interface ServiceListingListProps {
  publications: SearchPublication[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const ServiceListingList = (props: ServiceListingListProps) => {
  const { publications, onItemClick, isLoading } = props;

  if (isLoading) {
    return (
      <div className={classes.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (publications.length === 0) {
    return (
      <div className={classes.empty}>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={classes.grid}>
      {publications.map((publication) => (
        <ServiceListingItem
          key={publication.id}
          publication={publication}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
