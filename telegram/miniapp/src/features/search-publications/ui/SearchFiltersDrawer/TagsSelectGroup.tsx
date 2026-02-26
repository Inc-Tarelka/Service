import { Select } from '@mantine/core';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { TagList } from 'shared/ui/TagList';
import s from './SearchFiltersDrawer.module.scss';

interface TagsSelectGroupProps {
  selectedTags: Array<{ value: string; label: string }>;
  availableTags: Array<{ value: string; label: string }>;
  onAdd: (tagId: string | null) => void;
  onRemove: (tagId: string) => void;
}

export const TagsSelectGroup = ({
  selectedTags,
  availableTags,
  onAdd,
  onRemove,
}: TagsSelectGroupProps) => {
  return (
    <div className={s.inputGroup}>
      <span className={s.label}>Теги</span>
      <Select
        classNames={{ input: s.select }}
        value={null}
        onChange={onAdd}
        rightSection={
          <div style={{ pointerEvents: 'none', display: 'flex' }}>
            <ChevronDownIcon />
          </div>
        }
        placeholder="Выберите из списка"
        data={availableTags}
        radius={16}
        size="lg"
        searchable
        clearable={false}
      />
      <TagList tags={selectedTags} onRemove={onRemove} />
    </div>
  );
};
