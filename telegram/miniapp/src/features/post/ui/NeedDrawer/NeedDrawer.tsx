import {
  ActionIcon,
  Button,
  Drawer,
  Select,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRef, useState } from 'react';
import { PostNeed } from 'shared/api/service/Post/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import RubIcon from 'shared/assets/icons/rub';
import XIcon from 'shared/assets/icons/x';
import { DateInput } from 'shared/ui/DateInput';
import { DatePicker } from 'shared/ui/DatePicker';
import { TagList } from 'shared/ui/TagList';
import classes from './NeedDrawer.module.scss';

interface NeedDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (need: PostNeed) => void;
  tagsData: { value: string; label: string }[];
}

const MAX_DESCRIPTION_LENGTH = 100;

export const NeedDrawer = (props: NeedDrawerProps) => {
  const { opened, onClose, onSubmit, tagsData } = props;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState('');

  const [startDateOpened, { open: openStartDate, close: closeStartDate }] =
    useDisclosure(false);
  const [endDateOpened, { open: openEndDate, close: closeEndDate }] =
    useDisclosure(false);

  const [tempDate, setTempDate] = useState<Date>(new Date());

  const endDateRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (tagId: string | null) => {
    if (tagId && !tagIds.includes(tagId)) {
      setTagIds([...tagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTagIds(tagIds.filter((id) => id !== tagId));
  };

  const selectedTags = tagsData.filter((tag) => tagIds.includes(tag.value));
  const availableTags = tagsData.filter((tag) => !tagIds.includes(tag.value));

  const handleSubmit = () => {
    const need: PostNeed = {
      title,
      description,
      tagIds,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budget || undefined,
    };
    onSubmit(need);
    // Reset form
    setTitle('');
    setDescription('');
    setTagIds([]);
    setStartDate(null);
    setEndDate(null);
    setBudget('');
    onClose();
  };

  const handleStartDateConfirm = () => {
    setStartDate(tempDate);
    closeStartDate();
  };

  const handleEndDateConfirm = () => {
    setEndDate(tempDate);
    closeEndDate();
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="100%"
        withCloseButton={false}
        classNames={{ content: 'drawer-fulldevice' }}
        styles={{
          content: {
            background: 'var(--sheet-bg-color)',
            borderRadius: '32px 32px 0 0',
          },
          body: { padding: 0 },
        }}
      >
        <div className={classes.drawer}>
          <div className={classes.header}>
            <h1 className={classes.title}>Потребность</h1>
          </div>

          <div className={classes.content}>
            <div className={classes.inputGroup}>
              <span className={classes.label}>Название</span>
              <TextInput
                classNames={{ input: classes.input }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название"
                radius={24}
                size="lg"
              />
            </div>

            <div className={classes.inputGroup}>
              <div className={classes.labelRow}>
                <span className={classes.label}>Описание</span>
                <span className={classes.charCount}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                classNames={{ input: classes.textarea }}
                value={description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
                  setDescription(value);
                }}
                placeholder="Опишите вакансию или потребность в услуге"
                radius={24}
                size="lg"
                maxLength={MAX_DESCRIPTION_LENGTH}
                autosize
                minRows={3}
                maxRows={6}
              />
            </div>

            <div className={classes.inputGroup}>
              <span className={classes.label}>Теги для поиска</span>
              <Select
                classNames={{ input: classes.select }}
                value={null}
                onChange={handleAddTag}
                rightSection={
                  <div style={{ pointerEvents: 'none', display: 'flex' }}>
                    <ChevronDownIcon />
                  </div>
                }
                placeholder="Выберите из списка"
                data={availableTags}
                radius={24}
                size="lg"
                searchable
                clearable={false}
              />
              <TagList tags={selectedTags} onRemove={handleRemoveTag} />
            </div>

            <div className={classes.inputGroup}>
              <span className={classes.label}>Сроки</span>
              <div className={classes.datesContainer}>
                <DateInput
                  value={startDate}
                  onChange={setStartDate}
                  onIconClick={() => {
                    setTempDate(startDate || new Date());
                    openStartDate();
                  }}
                  onComplete={() => {
                    endDateRef.current?.focus();
                  }}
                  placeholder="__.__.____"
                />
                <span className={classes.dateSeparator}>-</span>
                <DateInput
                  ref={endDateRef}
                  value={endDate}
                  onChange={setEndDate}
                  onIconClick={() => {
                    setTempDate(endDate || new Date());
                    openEndDate();
                  }}
                  placeholder="__.__.____"
                />
              </div>
            </div>

            <div className={classes.inputGroup}>
              <span className={classes.label}>Бюджет</span>
              <TextInput
                classNames={{ input: classes.budgetInput }}
                value={budget}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setBudget(value);
                }}
                placeholder="Введите сумму"
                rightSection={
                  <span
                    style={{
                      color: 'var(--text-color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <RubIcon />
                  </span>
                }
                radius={24}
                size="lg"
              />
            </div>
          </div>

          <div className={classes.footer}>
            <ActionIcon
              onClick={onClose}
              variant="outline"
              size={48}
              radius="40"
            >
              <XIcon />
            </ActionIcon>
            <Button
              className={classes.submitButton}
              onClick={handleSubmit}
              radius="xl"
              variant="filled"
              fullWidth
              size="lg"
              disabled={
                !title || !description || !startDate || !endDate || !budget
              }
              bg="var(--accent-color)"
              c="var(--bg-color)"
            >
              Добавить
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        opened={startDateOpened}
        onClose={closeStartDate}
        position="bottom"
        size="xs"
        withCloseButton={false}
        styles={{
          content: {
            background: 'var(--bg-color)',
            borderRadius: '24px 24px 0 0',
          },
          body: { padding: 0 },
        }}
      >
        <div className={classes.dateDrawer}>
          <div className={classes.dateDrawerTitle}>Сроки</div>
          <DatePicker value={tempDate} onChange={setTempDate} />
          <div className={classes.dateDrawerFooter}>
            <Button
              variant="outline"
              radius="xl"
              size="lg"
              fullWidth
              onClick={closeStartDate}
            >
              Отмена
            </Button>
            <Button
              radius="xl"
              size="lg"
              variant="filled"
              fullWidth
              onClick={handleStartDateConfirm}
            >
              Готово
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer
        opened={endDateOpened}
        onClose={closeEndDate}
        position="bottom"
        size="xs"
        withCloseButton={false}
        styles={{
          content: {
            background: 'var(--bg-color)',
            borderRadius: '24px 24px 0 0',
          },
          body: { padding: 0 },
        }}
      >
        <div className={classes.dateDrawer}>
          <div className={classes.dateDrawerTitle}>Сроки</div>
          <DatePicker value={tempDate} onChange={setTempDate} />
          <div className={classes.dateDrawerFooter}>
            <Button
              variant="outline"
              radius="xl"
              size="lg"
              fullWidth
              onClick={closeEndDate}
            >
              Отмена
            </Button>
            <Button
              radius="xl"
              size="lg"
              variant="filled"
              fullWidth
              onClick={handleEndDateConfirm}
            >
              Готово
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
