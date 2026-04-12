import { getProfileDisplayData } from 'entities/search-listing/lib/profileHelpers';
import { UserAvatar } from 'entities/user';
import type { SearchUser } from 'shared/api/service/UserSearch';
import s from './ProfileListingItem.module.scss';

interface ProfileListingItemProps {
  user: SearchUser;
  onClick?: (id: number) => void;
}

export const ProfileListingItem = (props: ProfileListingItemProps) => {
  const { user, onClick } = props;
  const { name, userId, specializations, cities, logoUrl, username } =
    getProfileDisplayData(user);

  const projectImages = (user.projectTopImages ?? [])
    .filter((url) => url.startsWith('http'))
    .slice(0, 3);

  const handleProjectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(userId);
  };

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

      {projectImages.length > 0 && (
        <div className={s.projects} data-tab-swipe-lock="true">
          {projectImages.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              className={s.projectImage}
              alt={`Project ${index + 1}`}
              onClick={handleProjectClick}
              role="button"
              tabIndex={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};
