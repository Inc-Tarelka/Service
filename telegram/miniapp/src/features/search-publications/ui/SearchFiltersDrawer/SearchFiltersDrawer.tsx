import { ActionIcon, Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import type { SearchPublicationsParams } from 'shared/api/service/Publication';
import { SearchPublicationsType } from 'shared/api/types';
import XIcon from 'shared/assets/icons/x';
import { DRAWER_SIZES, DRAWER_STYLES } from '../../lib/constants';
import { useSearchFilters } from '../../model/useSearchFilters';
import { DatePickerDrawer } from './DatePickerDrawer';
import { NeedFilters } from './NeedFilters';
import { ProfileFilters } from './ProfileFilters';
import { ServiceFilters } from './ServiceFilters';
import s from './SearchFiltersDrawer.module.scss';

interface SearchFiltersDrawerProps {
  opened: boolean;
  onClose: () => void;
  activeTab: SearchPublicationsType;
  currentFilters: SearchPublicationsParams;
  onApply: (filters: SearchPublicationsParams) => void;
}

export const SearchFiltersDrawer = observer(
  (props: SearchFiltersDrawerProps) => {
    const { opened, onClose, activeTab, currentFilters, onApply } = props;

    const [startDateOpened, { open: openStartDate, close: closeStartDate }] =
      useDisclosure(false);
    const [endDateOpened, { open: openEndDate, close: closeEndDate }] =
      useDisclosure(false);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const {
      filters,
      setFilters,
      selectedTags,
      availableTags,
      handleAddTag,
      handleRemoveTag,
    } = useSearchFilters(currentFilters, onApply, opened);

    const drawerSize = DRAWER_SIZES[activeTab] || '80%';

    const handleLocalApply = () => {
      let finalFilters = { ...filters };
      if (
        activeTab === SearchPublicationsType.PROFILE &&
        !finalFilters.authorType
      ) {
        finalFilters.authorType = 'PERSON';
      }
      onApply(finalFilters);
    };

    return (
      <>
        <Drawer
          key={activeTab}
          opened={opened}
          onClose={onClose}
          position="bottom"
          size={drawerSize}
          withCloseButton={false}
          trapFocus={false}
          styles={DRAWER_STYLES}
        >
          <div className={s.drawer}>
            <div className={s.header}></div>

            <div className={s.content}>
              {activeTab === SearchPublicationsType.PROFILE && (
                <ProfileFilters filters={filters} onChange={setFilters} />
              )}

              {activeTab === SearchPublicationsType.SERVICE && (
                <ServiceFilters
                  filters={filters}
                  onChange={setFilters}
                  selectedTags={selectedTags}
                  availableTags={availableTags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              )}

              {activeTab === SearchPublicationsType.NEED && (
                <NeedFilters
                  filters={filters}
                  onChange={setFilters}
                  selectedTags={selectedTags}
                  availableTags={availableTags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  onStartDateIconClick={() => {
                    setTempDate(
                      filters.deadlineStart
                        ? new Date(filters.deadlineStart)
                        : new Date(),
                    );
                    openStartDate();
                  }}
                  onEndDateIconClick={() => {
                    setTempDate(
                      filters.deadlineEnd
                        ? new Date(filters.deadlineEnd)
                        : new Date(),
                    );
                    openEndDate();
                  }}
                />
              )}
            </div>

            <div
              className={`${s.footer} ${
                activeTab === SearchPublicationsType.NEED ? s.footerBottom : ''
              }`}
            >
              <ActionIcon
                onClick={onClose}
                variant="outline"
                size={48}
                radius="40"
              >
                <XIcon />
              </ActionIcon>
              <Button
                className={s.submitButton}
                onClick={handleLocalApply}
                radius="xl"
                variant="filled"
                fullWidth
                size="lg"
                bg="var(--accent-color)"
                c="var(--bg-color)"
              >
                Применить
              </Button>
            </div>
          </div>
        </Drawer>

        <DatePickerDrawer
          opened={startDateOpened}
          onClose={closeStartDate}
          title="Начало"
          value={tempDate}
          onChange={setTempDate}
          onConfirm={() => {
            setFilters({ ...filters, deadlineStart: tempDate.toISOString() });
            closeStartDate();
          }}
        />

        <DatePickerDrawer
          opened={endDateOpened}
          onClose={closeEndDate}
          title="Конец"
          value={tempDate}
          onChange={setTempDate}
          onConfirm={() => {
            setFilters({ ...filters, deadlineEnd: tempDate.toISOString() });
            closeEndDate();
          }}
        />
      </>
    );
  },
);
