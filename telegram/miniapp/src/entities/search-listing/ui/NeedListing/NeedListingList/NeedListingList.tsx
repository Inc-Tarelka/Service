import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import { NeedListingItem } from '../NeedListingItem/NeedListingItem';
import { NeedListingSkeleton } from '../NeedListingSkeleton/NeedListingSkeleton';
import classes from './NeedListingList.module.scss';

interface NeedListingListProps {
  needs: SearchNeedItem[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const NeedListingList = (props: NeedListingListProps) => {
  const { needs, onItemClick, isLoading } = props;

  if (isLoading) {
    return (
      <div className={classes.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <NeedListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!needs || needs.length === 0) {
    return (
      <div className={classes.empty}>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={classes.list}>
      {needs.map((need) => (
        <NeedListingItem key={need.id} need={need} onClick={onItemClick} />
      ))}
    </div>
  );
};
