import { forwardRef, useEffect, useRef, useState } from 'react';
import CalendarIcon from 'shared/assets/icons/calendar';
import {
  formatDateMask,
  formatDateToInput,
  parseDateInput,
} from 'shared/lib/utils/date-mask';
import classes from './DateInput.module.scss';

interface DateInputProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onIconClick: () => void;
  onComplete?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      onIconClick,
      onComplete,
      placeholder = '__.__.____',
      autoFocus,
    } = props;

    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    useEffect(() => {
      if (value && !isFocused) {
        setInputValue(formatDateToInput(value));
      }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const digits = rawInput.replace(/\D/g, '');

      if (digits.length > 8) return;

      const formatted = formatDateMask(digits);
      setInputValue(formatted);

      if (digits.length !== 8) {
        onChange(null);
        return;
      }

      const parsed = parseDateInput(formatted);
      onChange(parsed);

      if (parsed && onComplete) {
        setTimeout(onComplete, 50);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);

      const digits = inputValue.replace(/\D/g, '');

      if (digits.length > 0 && digits.length < 8) {
        setInputValue('');
        onChange(null);
        return;
      }

      if (digits.length === 8) {
        const parsed = parseDateInput(inputValue);
        if (!parsed) {
          setInputValue('');
          onChange(null);
        }
      }
    };

    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onIconClick();
    };

    return (
      <div className={classes.container}>
        <input
          ref={inputRef}
          type="text"
          className={`${classes.input} ${isFocused ? classes.focused : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          inputMode="numeric"
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className={classes.iconButton}
          onClick={handleIconClick}
          tabIndex={-1}
        >
          <CalendarIcon />
        </button>
      </div>
    );
  },
);

DateInput.displayName = 'DateInput';
