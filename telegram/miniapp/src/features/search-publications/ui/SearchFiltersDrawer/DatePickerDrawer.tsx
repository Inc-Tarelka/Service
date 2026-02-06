import { Button, Drawer } from '@mantine/core';
import { DatePicker } from 'shared/ui/DatePicker';
import s from './SearchFiltersDrawer.module.scss';
import { DATE_DRAWER_STYLES } from '../../lib/constants';

interface DatePickerDrawerProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  value: Date;
  onChange: (date: Date) => void;
  onConfirm: () => void;
}

export const DatePickerDrawer = ({
  opened,
  onClose,
  title,
  value,
  onChange,
  onConfirm,
}: DatePickerDrawerProps) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size={320}
      zIndex={10001}
      withCloseButton={false}
      styles={DATE_DRAWER_STYLES}
    >
      <div className={s.dateDrawer}>
        <div className={s.dateDrawerTitle}>{title}</div>
        <DatePicker value={value} onChange={onChange} />
        <div className={s.dateDrawerFooter}>
          <Button
            variant="outline"
            radius="xl"
            size="lg"
            fullWidth
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            radius="xl"
            size="lg"
            variant="filled"
            fullWidth
            onClick={onConfirm}
            c="var(--bg-color)"
          >
            Готово
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
