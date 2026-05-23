import { Select } from '@mantine/core';
import { CitiesListSkeleton } from 'features/auth/ui/ProfileForm/CitiesLIst.skeleton';
import { transformCitiesForSelect } from 'features/search-publications/lib/transformers';
import { observer } from 'mobx-react-lite';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import s from './EditProfileForm.module.scss';

interface CitySelectProps {
  value: string | undefined;
  onChange: (cityId: string | undefined) => void;
  error?: string;
}

export const CitySelect = observer(
  ({ value, onChange, error }: CitySelectProps) => {
    const citiesData = transformCitiesForSelect(referenceStore.cities);
    const isLoading = referenceStore.citiesData?.state === 'pending';

    return (
      <div className={s.inputGroup}>
        <span className={s.label}>Город</span>
        <Select
          classNames={{ input: s.select }}
          value={value ? String(value) : null}
          onChange={(val) => onChange(val ? String(val) : undefined)}
          onDropdownOpen={() => referenceStore.getCitiesAction()}
          rightSection={
            <div style={{ pointerEvents: 'none', display: 'flex' }}>
              <ChevronDownIcon />
            </div>
          }
          placeholder="Выберите город"
          data={citiesData}
          nothingFoundMessage={
            isLoading ? <CitiesListSkeleton /> : 'Ничего не найдено'
          }
          radius="xl"
          size="lg"
          searchable
          clearable
          error={error}
          comboboxProps={{ withinPortal: false }}
          filter={({ options, search }) => {
            if (isLoading) return options;
            return options.filter((option) =>
              'label' in option
                ? option.label
                    ?.toLowerCase()
                    .includes(search.toLowerCase().trim())
                : false,
            );
          }}
        />
      </div>
    );
  },
);
