import { getProfileDisplayData } from 'entities/search-listing/lib/profileHelpers';
import { UserAvatar } from 'entities/user';
import type { SearchUser } from 'shared/api/service/UserSearch';
import s from './ProfileListingItem.module.scss';

interface ProfileListingItemProps {
  user: SearchUser;
  onClick?: (id: number) => void;
}

// Mocked project images
const MOCKED_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2864&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop',
];

export const ProfileListingItem = (props: ProfileListingItemProps) => {
  const { user, onClick } = props;
  const { name, userId, specializations, cities, logoUrl, username } =
    getProfileDisplayData(user);

  return (
    <div
      className={s.container}
      onClick={() => onClick?.(userId)}
      role="button"
      tabIndex={0}
    >
      <div className={s.header}>
        <UserAvatar src={logoUrl} className={s.avatar} size={48} />
        <div className={s.info}>
          <div className={s.nameRow}>
            <h3 className={s.name}>{name}</h3>
          </div>
          {username && <p className={s.username}>@{username}</p>}
          <p className={s.details}>
            {specializations}, {cities}
          </p>
        </div>
      </div>

      <div className={s.projects}>
        {MOCKED_IMAGES.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            className={s.projectImage}
            alt={`Project ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
