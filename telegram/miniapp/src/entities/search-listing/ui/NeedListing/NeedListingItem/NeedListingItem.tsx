import clsx from 'clsx';
import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import s from './NeedListingItem.module.scss';

interface NeedListingItemProps {
  need: SearchNeedItem;
  onClick?: (id: number) => void;
  hideProjectAndCity?: boolean;
}

export const NeedListingItem = (props: NeedListingItemProps) => {
  const { need, onClick, hideProjectAndCity } = props;

  return (
    <div
      className={clsx(s.container, { [s.compact]: hideProjectAndCity })}
      onClick={() => onClick?.(need.id)}
    >
      <div className={s.header}>
        <h3 className={s.title}>{need.name}</h3>
        {hideProjectAndCity && <ChevronRightIcon className={s.chevron} />}
      </div>

      {need.description && <p className={s.description}>{need.description}</p>}

      {!hideProjectAndCity && (
        <>
          <div className={s.projectSection}>
            <span className={s.projectLabel}>Проект:</span>
            <span className={s.projectName}>{need.publicationName}</span>
          </div>

          {need.cityName && <div className={s.city}>{need.cityName}</div>}
        </>
      )}
    </div>
  );
};
