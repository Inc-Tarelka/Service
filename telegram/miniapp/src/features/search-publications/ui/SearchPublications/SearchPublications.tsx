import { ActionIcon, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type { SearchPublicationsParams } from 'shared/api/service/Publication';
import { SearchPublicationsType } from 'shared/api/types';
import FilterIcon from 'shared/assets/icons/filter';
import SearchIcon from 'shared/assets/icons/search';
import { SearchFiltersDrawer } from '../SearchFiltersDrawer/SearchFiltersDrawer';
import s from './SearchPublications.module.scss';

interface SearchPublicationsProps {
  activeTab: SearchPublicationsType;
  initialQuery?: string;
  onSearchComplete?: () => void;
  onSearchQueryChange?: (query: string) => void;
}

export const SearchPublications = observer((props: SearchPublicationsProps) => {
  const {
    activeTab,
    initialQuery = '',
    onSearchComplete,
    onSearchQueryChange,
  } = props;
  const { searchInteractionsStore } = useStore();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filtersOpened, setFiltersOpened] = useState(false);
  const [filters, setFilters] = useState<SearchPublicationsParams>({});
  const [debouncedQuery] = useDebouncedValue(searchQuery, 500);

  useEffect(() => {
    searchInteractionsStore.performSearch(activeTab, debouncedQuery, filters);
    onSearchComplete?.();
  }, [
    debouncedQuery,
    filters,
    activeTab,
    searchInteractionsStore,
    onSearchComplete,
  ]);

  const handleApplyFilters = (newFilters: SearchPublicationsParams) => {
    setFilters(newFilters);
    setFiltersOpened(false);
  };

  return (
    <>
      <div className={s.searchRow}>
        <TextInput
          className={s.search}
          rightSection={<SearchIcon />}
          placeholder={'Поиск'}
          radius="xl"
          size="lg"
          value={searchQuery}
          onChange={(e) => {
            const newQuery = e.currentTarget.value;
            setSearchQuery(newQuery);
            onSearchQueryChange?.(newQuery);
          }}
        />
        <ActionIcon
          className={s.filterBtn}
          variant="outline"
          size={48}
          radius={16}
          onClick={() => setFiltersOpened(true)}
        >
          <FilterIcon />
        </ActionIcon>
      </div>

      <SearchFiltersDrawer
        opened={filtersOpened}
        onClose={() => setFiltersOpened(false)}
        activeTab={activeTab}
        currentFilters={filters}
        onApply={handleApplyFilters}
      />
    </>
  );
});
