import { Select } from '@mantine/core';
import { SpecializationsListSkeleton } from 'features/auth/ui/ProfileForm/SpecializationsList.skeleton';
import { transformSpecializationsForSelect } from 'features/search-publications/lib/transformers';
import { observer } from 'mobx-react-lite';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import s from './EditProfileForm.module.scss';

interface SpecializationSelectProps {
  value: string | undefined;
  onChange: (specId: string | undefined) => void;
  error?: string;
}

export const SpecializationSelect = observer(
  ({ value, onChange, error }: SpecializationSelectProps) => {
    const specializationsData = transformSpecializationsForSelect(
      referenceStore.specializations,
    );
    const isLoading = referenceStore.specializationsData?.state === 'pending';

    return (
      <div className={s.inputGroup}>
        <span className={s.label}>Специализация</span>
        <Select
          classNames={{ input: s.select }}
          value={value ? String(value) : null}
          onChange={(val) => onChange(val ? String(val) : undefined)}
          onDropdownOpen={() => referenceStore.getSpecializationsAction()}
          rightSection={
            <div style={{ pointerEvents: 'none', display: 'flex' }}>
              <ChevronDownIcon />
            </div>
          }
          placeholder="Выберите специализацию"
          data={specializationsData}
          nothingFoundMessage={
            isLoading ? <SpecializationsListSkeleton /> : 'Ничего не найдено'
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
