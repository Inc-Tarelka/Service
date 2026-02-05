import type { SearchPublication } from 'shared/api/service/Publication';
import { NeedListingItem } from '../NeedListingItem/NeedListingItem';
import { NeedListingSkeleton } from '../NeedListingSkeleton/NeedListingSkeleton';
import classes from './NeedListingList.module.scss';

interface NeedListingListProps {
  publications: SearchPublication[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const NeedListingList = (props: NeedListingListProps) => {
  const { publications, onItemClick, isLoading } = props;

  if (isLoading) {
    return (
      <div className={classes.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <NeedListingSkeleton key={index} />
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
    <div className={classes.list}>
      {publications.map((publication) => (
        <NeedListingItem
          key={publication.id}
          publication={publication}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
