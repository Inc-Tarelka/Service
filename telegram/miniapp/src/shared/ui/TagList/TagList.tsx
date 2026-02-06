import XIcon from 'shared/assets/icons/x';
import classes from './TagList.module.scss';

export interface TagItem {
  value: string;
  label: string;
}

interface TagListProps {
  tags: TagItem[];
  onRemove?: (value: string) => void;
  showRemoveButton?: boolean;
}

export const TagList = (props: TagListProps) => {
  const { tags, onRemove, showRemoveButton = true } = props;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={classes.tagList}>
      {tags.map((tag) => (
        <div key={tag.value} className={classes.tag}>
          {tag.label}
          {showRemoveButton && onRemove && (
            <button
              type="button"
              className={classes.tagClose}
              onClick={() => onRemove(tag.value)}
            >
              <XIcon />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
