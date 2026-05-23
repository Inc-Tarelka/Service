import type { SearchUser } from 'shared/api/service/UserSearch';
import { ProfileListingItem } from '../ProfileListingItem/ProfileListingItem';
import { ProfileListingSkeleton } from '../ProfileListingSkeleton/ProfileListingSkeleton';
import classes from './ProfileListingList.module.scss';

interface ProfileListingListProps {
  users: SearchUser[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

export const ProfileListingList = (props: ProfileListingListProps) => {
  const { users, onItemClick, isLoading, isLoadingMore } = props;

  if (isLoading && users.length === 0) {
    return (
      <div className={classes.list}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ProfileListingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={classes.empty}>
        <p>Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className={classes.list}>
      {users.map((user) => (
        <ProfileListingItem key={user.id} user={user} onClick={onItemClick} />
      ))}
      {isLoadingMore && (
        <div className={classes.loadMore}>
          {Array.from({ length: 2 }).map((_, index) => (
            <ProfileListingSkeleton key={`more-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};
