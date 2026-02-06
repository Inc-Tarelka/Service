import { Button } from '@mantine/core';
import { PostNeed } from 'shared/api/service/Post/types';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import classes from './AddNeeds.module.scss';

interface AddNeedsProps {
  needs: PostNeed[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  tagsData: { value: string; label: string }[];
  onNeedClick?: (need: PostNeed) => void;
}

export const AddNeeds = (props: AddNeedsProps) => {
  const { needs, onAdd, onRemove, onNeedClick } = props;

  return (
    <div className={classes.section}>
      <div className={classes.header}>
        <span className={classes.title}>Потребности</span>
        <span className={classes.subtitle}>
          Если в проект необходимы люди или услуги, вы можете указать это здесь.
        </span>
      </div>

      {needs.length > 0 && (
        <div className={classes.list}>
          {needs.map((need, index) => (
            <div
              key={index}
              className={classes.needItem}
              onClick={() => onNeedClick?.(need)}
            >
              <div className={classes.needContent}>
                <span className={classes.needTitle}>{need.title}</span>
                <p className={classes.needDescription}>{need.description}</p>
              </div>
              <button
                type="button"
                className={classes.viewMore}
                onClick={() => onNeedClick?.(need)}
              >
                Смотреть
                <ChevronRightIcon />
              </button>
              <button
                type="button"
                className={classes.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        fullWidth
        radius="xl"
        size="lg"
        onClick={onAdd}
        leftSection={<PlusIcon />}
      >
        Добавить
      </Button>
    </div>
  );
};
