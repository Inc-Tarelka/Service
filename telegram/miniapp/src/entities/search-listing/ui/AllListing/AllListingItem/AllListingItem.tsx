import type { SearchAllItem } from 'shared/api/service/SearchAll';
import classes from './AllListingItem.module.scss';

interface AllListingItemProps {
  item: SearchAllItem;
  onClick?: (item: SearchAllItem) => void;
}

const TYPE_LABEL: Record<SearchAllItem['type'], string> = {
  service: 'Услуга',
  need: 'Потребность',
  profile: 'Профиль',
};

export const AllListingItem = ({ item, onClick }: AllListingItemProps) => {
  const handleClick = () => onClick?.(item);

  return (
    <div
      className={classes.item}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={classes.avatar}>
        {item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.title}
            className={classes.avatarImg}
          />
        ) : (
          <span className={classes.avatarFallback}>
            {item.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className={classes.content}>
        <div className={classes.header}>
          <span className={classes.title}>{item.title}</span>
          <span className={`${classes.badge} ${classes[item.type]}`}>
            {TYPE_LABEL[item.type]}
          </span>
        </div>
        {item.description && (
          <p className={classes.description}>{item.description}</p>
        )}
        {(item.cityName || item.username) && (
          <p className={classes.meta}>
            {item.cityName && <span>{item.cityName}</span>}
            {item.username && <span>@{item.username}</span>}
          </p>
        )}
      </div>
    </div>
  );
};
