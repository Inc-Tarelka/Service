import type { SearchPublication } from 'shared/api/service/Publication';
import { MAX_VISIBLE_TAGS } from '../../../lib/constants';
import { formatBudget, formatDateRange } from '../../../lib/formatters';
import s from './NeedListingItem.module.scss';

interface NeedListingItemProps {
  publication: SearchPublication;
  onClick?: (id: number) => void;
}

export const NeedListingItem = (props: NeedListingItemProps) => {
  const { publication, onClick } = props;
  const firstNeed = publication.needs?.[0];

  return (
    <div className={s.container} onClick={() => onClick?.(publication.id)}>
      <div className={s.header}>
        <h3 className={s.title}>{firstNeed?.name || publication.name}</h3>
        {firstNeed?.budget && (
          <span className={s.budget}>{formatBudget(firstNeed.budget)}</span>
        )}
      </div>

      {firstNeed?.description && (
        <p className={s.description}>{firstNeed.description}</p>
      )}

      <div className={s.footer}>
        {firstNeed?.tags && firstNeed.tags.length > 0 && (
          <div className={s.tags}>
            {firstNeed.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <span key={tag.id} className={s.tag}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
        {(firstNeed?.deadlineStart || firstNeed?.deadlineEnd) && (
          <span className={s.deadline}>
            {formatDateRange(firstNeed.deadlineStart, firstNeed.deadlineEnd)}
          </span>
        )}
      </div>
    </div>
  );
};
