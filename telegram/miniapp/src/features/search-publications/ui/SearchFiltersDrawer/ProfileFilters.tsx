import { Button, Select } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import type { SearchPublicationsParams } from 'shared/api/service/Publication';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import {
  transformSpecializationsForSelect,
  WORKING_STATUS_OPTIONS,
} from '../../lib/transformers';
import { CitySelect } from './CitySelect';
import s from './SearchFiltersDrawer.module.scss';

interface ProfileFiltersProps {
  filters: SearchPublicationsParams;
  onChange: (filters: SearchPublicationsParams) => void;
}

export const ProfileFilters = observer(
  ({ filters, onChange }: ProfileFiltersProps) => {
    const specializationsData = transformSpecializationsForSelect(
      referenceStore.specializations,
    );

    return (
      <>
        <div className={s.inputGroup}>
          <span className={s.label}>Специализация</span>
          <Select
            classNames={{ input: s.select }}
            value={
              filters.specializationId ? String(filters.specializationId) : null
            }
            onChange={(val) =>
              onChange({
                ...filters,
                specializationId: val ? Number(val) : undefined,
              })
            }
            onDropdownOpen={() => referenceStore.getSpecializationsAction()}
            rightSection={
              <div style={{ pointerEvents: 'none', display: 'flex' }}>
                <ChevronDownIcon />
              </div>
            }
            placeholder="Выберите специализацию"
            data={specializationsData}
            radius={24}
            size="lg"
            searchable
            clearable
          />
        </div>

        <div className={s.typeSelector}>
          <Button
            className={`${s.typeButton} ${
              filters.authorType === 'PERSON' || !filters.authorType
                ? s.active
                : ''
            }`}
            onClick={() => onChange({ ...filters, authorType: 'PERSON' })}
            variant="filled"
            radius="xl"
          >
            Специалист
          </Button>
          <Button
            className={`${s.typeButton} ${
              filters.authorType === 'COMPANY' ? s.active : ''
            }`}
            onClick={() => onChange({ ...filters, authorType: 'COMPANY' })}
            variant="filled"
            radius="xl"
          >
            Компания
          </Button>
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Статус поиска работы</span>
          <Select
            classNames={{ input: s.select }}
            value={filters.workingStatus || null}
            onChange={(val) =>
              onChange({
                ...filters,
                workingStatus: val as any,
              })
            }
            rightSection={
              <div style={{ pointerEvents: 'none', display: 'flex' }}>
                <ChevronDownIcon />
              </div>
            }
            placeholder="Выберите статус"
            data={WORKING_STATUS_OPTIONS}
            radius={24}
            size="lg"
            clearable
          />
        </div>

        <CitySelect
          value={filters.cityId}
          onChange={(cityId) => onChange({ ...filters, cityId })}
        />
      </>
    );
  },
);
