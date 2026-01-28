import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classes from './DatePicker.module.scss';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() + i,
);

const ITEM_HEIGHT = 40;

export const DatePicker = (props: DatePickerProps) => {
  const { value, onChange } = props;

  const initialDate = value || new Date();
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const DAYS = useMemo(() => {
    const daysInMonth = dayjs(
      new Date(selectedYear, selectedMonth, 1),
    ).daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const maxDay = dayjs(
      new Date(selectedYear, selectedMonth, 1),
    ).daysInMonth();
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
  }, [selectedDay, selectedMonth, selectedYear, onChange]);

  useEffect(() => {
    const scrollToIndex = (
      ref: React.RefObject<HTMLDivElement | null>,
      index: number,
    ) => {
      if (ref.current) {
        ref.current.scrollTop = index * ITEM_HEIGHT;
      }
    };

    setTimeout(() => {
      scrollToIndex(dayRef, selectedDay - 1);
      scrollToIndex(monthRef, selectedMonth);
      scrollToIndex(yearRef, YEARS.indexOf(selectedYear));
    }, 50);
  }, []);

  const handleScroll = useCallback(
    (
      ref: React.RefObject<HTMLDivElement | null>,
      items: (number | string)[],
      setter: (value: number) => void,
      isMonth = false,
    ) => {
      return () => {
        if (ref.current) {
          const scrollTop = ref.current.scrollTop;
          const index = Math.round(scrollTop / ITEM_HEIGHT);
          const clampedIndex = Math.max(0, Math.min(items.length - 1, index));

          if (isMonth) {
            setter(clampedIndex);
          } else {
            setter(items[clampedIndex] as number);
          }
        }
      };
    },
    [],
  );

  const renderColumn = (
    ref: React.RefObject<HTMLDivElement | null>,
    items: (number | string)[],
    selectedValue: number | string,
    onScroll: () => void,
    label: string,
  ) => (
    <div className={classes.column}>
      <span className={classes.columnLabel}>{label}</span>
      <div className={classes.wheelWrapper}>
        <div className={classes.selectionHighlight} />
        <div ref={ref} className={classes.scrollContainer} onScroll={onScroll}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`${classes.item} ${item === selectedValue ? classes.selected : ''}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={classes.pickerContainer}>
      {renderColumn(
        dayRef,
        DAYS,
        selectedDay,
        handleScroll(dayRef, DAYS, setSelectedDay),
        'День',
      )}
      {renderColumn(
        monthRef,
        MONTHS,
        MONTHS[selectedMonth],
        handleScroll(monthRef, MONTHS, setSelectedMonth, true),
        'Месяц',
      )}
      {renderColumn(
        yearRef,
        YEARS,
        selectedYear,
        handleScroll(yearRef, YEARS, setSelectedYear),
        'Год',
      )}
    </div>
  );
};
