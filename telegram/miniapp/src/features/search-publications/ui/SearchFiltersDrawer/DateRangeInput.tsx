import { useRef } from 'react';
import { DateInput } from 'shared/ui/DateInput';
import s from './SearchFiltersDrawer.module.scss';

interface DateRangeInputProps {
  startDate: string | undefined;
  endDate: string | undefined;
  onStartChange: (date: Date | null) => void;
  onEndChange: (date: Date | null) => void;
  onStartIconClick: () => void;
  onEndIconClick: () => void;
}

export const DateRangeInput = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onStartIconClick,
  onEndIconClick,
}: DateRangeInputProps) => {
  const endDateRef = useRef<HTMLInputElement>(null);

  return (
    <div className={s.inputGroup}>
      <span className={s.label}>Сроки</span>
      <div className={s.datesContainer}>
        <DateInput
          value={startDate ? new Date(startDate) : null}
          onChange={onStartChange}
          onIconClick={onStartIconClick}
          onComplete={() => endDateRef.current?.focus()}
          placeholder="__.__.____"
        />
        <span className={s.dateSeparator}>-</span>
        <DateInput
          ref={endDateRef}
          value={endDate ? new Date(endDate) : null}
          onChange={onEndChange}
          onIconClick={onEndIconClick}
          placeholder="__.__.____"
        />
      </div>
    </div>
  );
};
