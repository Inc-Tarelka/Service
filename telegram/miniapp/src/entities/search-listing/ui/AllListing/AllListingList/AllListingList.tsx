import type { SearchAllItem } from 'shared/api/service/SearchAll';
import { ServiceListingSkeleton } from '../../ServiceListing/ServiceListingSkeleton/ServiceListingSkeleton';
import { AllListingItem } from '../AllListingItem/AllListingItem';
import classes from './AllListingList.module.scss';

interface AllListingListProps {
  items: SearchAllItem[];
  onItemClick?: (item: SearchAllItem) => void;
  isLoading?: boolean;
}

export const AllListingList = (props: AllListingListProps) => {
  const { items, onItemClick, isLoading } = props;

  if (isLoading && items.length === 0) {
    return (
      <div className={classes.list}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={classes.empty}>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={classes.list}>
      {items.map((item) => (
        <AllListingItem
          key={`${item.type}-${item.id}`}
          item={item}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
