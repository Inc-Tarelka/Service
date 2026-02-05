import { useEffect, useState } from 'react';
import { SearchPublicationsParams } from 'shared/api/service/Publication';
import { tagsData } from 'shared/mocks/tagsMock';

export const useSearchFilters = (
  currentFilters: SearchPublicationsParams,
  onApply: (filters: SearchPublicationsParams) => void,
  opened: boolean,
) => {
  const [filters, setFilters] =
    useState<SearchPublicationsParams>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, opened]);

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({});
    onApply({});
  };

  // Логика тегов
  const selectedTagIds = (filters.tagIds as number[]) || [];
  const selectedTags = tagsData.filter((tag) =>
    selectedTagIds.includes(Number(tag.value)),
  );
  const availableTags = tagsData.filter(
    (tag) => !selectedTagIds.includes(Number(tag.value)),
  );

  const handleAddTag = (tagId: string | null) => {
    if (tagId && !selectedTagIds.includes(Number(tagId))) {
      setFilters({
        ...filters,
        tagIds: [...selectedTagIds, Number(tagId)],
      });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setFilters({
      ...filters,
      tagIds: selectedTagIds.filter((id) => id !== Number(tagId)),
    });
  };

  return {
    filters,
    setFilters,
    handleApply,
    handleReset,
    selectedTags,
    availableTags,
    handleAddTag,
    handleRemoveTag,
  };
};
