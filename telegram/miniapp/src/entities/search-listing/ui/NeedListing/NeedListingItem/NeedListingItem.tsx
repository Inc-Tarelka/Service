import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import s from './NeedListingItem.module.scss';

interface NeedListingItemProps {
  need: SearchNeedItem;
  onClick?: (id: number) => void;
}

export const NeedListingItem = (props: NeedListingItemProps) => {
  const { need, onClick } = props;

  return (
    <div className={s.container} onClick={() => onClick?.(need.id)}>
      <h3 className={s.title}>{need.name}</h3>

      {need.description && <p className={s.description}>{need.description}</p>}

      <div className={s.projectSection}>
        <span className={s.projectLabel}>Проект:</span>
        <span className={s.projectName}>{need.publicationName}</span>
      </div>

      {need.cityName && <div className={s.city}>{need.cityName}</div>}
    </div>
  );
};
