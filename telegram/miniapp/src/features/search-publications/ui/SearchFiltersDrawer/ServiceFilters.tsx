import type { SearchPublicationsParams } from 'shared/api/service/Publication';
import { CitySelect } from './CitySelect';
import { TagsSelectGroup } from './TagsSelectGroup';

interface ServiceFiltersProps {
  filters: SearchPublicationsParams;
  onChange: (filters: SearchPublicationsParams) => void;
  selectedTags: Array<{ value: string; label: string }>;
  availableTags: Array<{ value: string; label: string }>;
  onAddTag: (tagId: string | null) => void;
  onRemoveTag: (tagId: string) => void;
}

export const ServiceFilters = (props: ServiceFiltersProps) => {
  const {
    filters,
    onChange,
    selectedTags,
    availableTags,
    onAddTag,
    onRemoveTag,
  } = props;
  return (
    <>
      <CitySelect
        value={filters.cityId}
        onChange={(cityId) => onChange({ ...filters, cityId })}
      />
      <TagsSelectGroup
        selectedTags={selectedTags}
        availableTags={availableTags}
        onAdd={onAddTag}
        onRemove={onRemoveTag}
      />
    </>
  );
};
