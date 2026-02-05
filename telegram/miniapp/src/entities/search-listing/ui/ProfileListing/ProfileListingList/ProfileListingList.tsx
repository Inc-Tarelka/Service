import type { SearchPublication } from 'shared/api/service/Publication';
import { ProfileListingItem } from '../ProfileListingItem/ProfileListingItem';
import { ProfileListingSkeleton } from '../ProfileListingSkeleton/ProfileListingSkeleton';
import classes from './ProfileListingList.module.scss';

interface ProfileListingListProps {
  publications: SearchPublication[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const ProfileListingList = (props: ProfileListingListProps) => {
  const { publications, onItemClick, isLoading } = props;

  if (isLoading) {
    return (
      <div className={classes.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ProfileListingSkeleton key={index} />
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
        <ProfileListingItem
          key={publication.id}
          publication={publication}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
