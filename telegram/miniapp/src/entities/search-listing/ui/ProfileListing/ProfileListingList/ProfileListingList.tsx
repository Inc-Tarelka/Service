import type { SearchUser } from 'shared/api/service/UserSearch';
import { ProfileListingItem } from '../ProfileListingItem/ProfileListingItem';
import { ProfileListingSkeleton } from '../ProfileListingSkeleton/ProfileListingSkeleton';
import classes from './ProfileListingList.module.scss';

interface ProfileListingListProps {
  users: SearchUser[];
  onItemClick?: (id: number) => void;
  isLoading?: boolean;
}

export const ProfileListingList = (props: ProfileListingListProps) => {
  const { users, onItemClick, isLoading } = props;

  if (isLoading) {
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
    </div>
  );
};
