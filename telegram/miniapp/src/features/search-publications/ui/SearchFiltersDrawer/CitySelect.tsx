import { Select } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { transformCitiesForSelect } from '../../lib/transformers';
import s from './SearchFiltersDrawer.module.scss';

interface CitySelectProps {
  value: number | undefined;
  onChange: (cityId: number | undefined) => void;
}

export const CitySelect = observer(({ value, onChange }: CitySelectProps) => {
  const citiesData = transformCitiesForSelect(referenceStore.cities);

  return (
    <div className={s.inputGroup}>
      <span className={s.label}>Город</span>
      <Select
        classNames={{ input: s.select }}
        value={value ? String(value) : null}
        onChange={(val) => onChange(val ? Number(val) : undefined)}
        onDropdownOpen={() => referenceStore.getCitiesAction()}
        rightSection={
          <div style={{ pointerEvents: 'none', display: 'flex' }}>
            <ChevronDownIcon />
          </div>
        }
        placeholder="Выберите город"
        data={citiesData}
        radius={16}
        size="lg"
        searchable
        clearable
      />
    </div>
  );
});
