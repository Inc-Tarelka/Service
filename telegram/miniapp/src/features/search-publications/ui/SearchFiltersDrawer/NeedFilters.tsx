import { TextInput } from '@mantine/core';
import type { SearchPublicationsParams } from 'shared/api/service/Publication';
import RubIcon from 'shared/assets/icons/rub';
import { CitySelect } from './CitySelect';
import { DateRangeInput } from './DateRangeInput';
import { TagsSelectGroup } from './TagsSelectGroup';
import s from './SearchFiltersDrawer.module.scss';

interface NeedFiltersProps {
  filters: SearchPublicationsParams;
  onChange: (filters: SearchPublicationsParams) => void;
  selectedTags: Array<{ value: string; label: string }>;
  availableTags: Array<{ value: string; label: string }>;
  onAddTag: (tagId: string | null) => void;
  onRemoveTag: (tagId: string) => void;
  onStartDateIconClick: () => void;
  onEndDateIconClick: () => void;
}

export const NeedFilters = (props: NeedFiltersProps) => {
  const {
    filters,
    onChange,
    selectedTags,
    availableTags,
    onAddTag,
    onRemoveTag,
    onStartDateIconClick,
    onEndDateIconClick,
  } = props;
  return (
    <>
      <TagsSelectGroup
        selectedTags={selectedTags}
        availableTags={availableTags}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
      />

      <CitySelect
        value={filters.cityId}
        onChange={(cityId) => onChange({ ...filters, cityId })}
      />

      <DateRangeInput
        startDate={filters.deadlineStart}
        endDate={filters.deadlineEnd}
        onStartChange={(date) =>
          onChange({ ...filters, deadlineStart: date?.toISOString() })
        }
        onEndChange={(date) =>
          onChange({ ...filters, deadlineEnd: date?.toISOString() })
        }
        onStartIconClick={onStartDateIconClick}
        onEndIconClick={onEndDateIconClick}
      />

      <div className={s.inputGroup}>
        <span className={s.label}>Бюджет</span>
        <TextInput
          classNames={{ input: s.budgetInput }}
          value={filters.budget ? String(filters.budget) : ''}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            onChange({
              ...filters,
              budget: value ? Number(value) : undefined,
            });
          }}
          placeholder="Введите сумму"
          rightSection={
            <span
              style={{
                color: 'var(--text-color-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RubIcon />
            </span>
          }
          radius={16}
          size="lg"
        />
      </div>
    </>
  );
};
