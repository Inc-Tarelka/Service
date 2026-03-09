import {
  ActionIcon,
  Button,
  Drawer,
  Select,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SpecializationsListSkeleton } from 'features/auth/ui/ProfileForm/SpecializationsList.skeleton';
import { useRef, useState } from 'react';
import { PostNeed } from 'shared/api/service/Post/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import RubIcon from 'shared/assets/icons/rub';
import XIcon from 'shared/assets/icons/x';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { DateInput } from 'shared/ui/DateInput';
import { DatePicker } from 'shared/ui/DatePicker';
import { TagList } from 'shared/ui/TagList';
import { needSchema } from '../../model/validation';
import classes from './NeedDrawer.module.scss';

interface NeedDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (need: PostNeed) => void;
  tagsData: { value: string; label: string }[];
  onTagsDropdownOpen?: () => void;
  tagsLoading?: boolean;
}

const MAX_DESCRIPTION_LENGTH = 100;

export const NeedDrawer = (props: NeedDrawerProps) => {
  const {
    opened,
    onClose,
    onSubmit,
    tagsData,
    onTagsDropdownOpen,
    tagsLoading,
  } = props;

  const [startDateOpened, { open: openStartDate, close: closeStartDate }] =
    useDisclosure(false);
  const [endDateOpened, { open: openEndDate, close: closeEndDate }] =
    useDisclosure(false);

  const [tempDate, setTempDate] = useState<Date>(new Date());

  const endDateRef = useRef<HTMLInputElement>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleInputChange,
    handleSubmit,
    setValues,
  } = useFormWithValidation({
    initialValues: {
      title: '',
      description: '',
      tagIds: [],
      startDate: null as any,
      endDate: null as any,
      budget: '',
    },
    schema: needSchema,
    onSubmit: async (values) => {
      const need: PostNeed = {
        title: values.title,
        description: values.description,
        tagIds: values.tagIds,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        budget: values.budget || undefined,
      };
      onSubmit(need);
      setValues({
        title: '',
        description: '',
        tagIds: [],
        startDate: null,
        endDate: null,
        budget: '',
      });
      onClose();
    },
  });

  const handleAddTag = (tagId: string | null) => {
    if (tagId && !values.tagIds.includes(tagId)) {
      handleChange('tagIds', [...values.tagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    handleChange(
      'tagIds',
      values.tagIds.filter((id) => id !== tagId),
    );
  };

  const selectedTags = tagsData.filter((tag) =>
    values.tagIds.includes(tag.value),
  );
  const availableTags = tagsData.filter(
    (tag) => !values.tagIds.includes(tag.value),
  );

  const handleStartDateConfirm = () => {
    handleChange('startDate', tempDate);
    closeStartDate();
  };

  const handleEndDateConfirm = () => {
    handleChange('endDate', tempDate);
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
                classNames={{
                  input: `${classes.input} ${errors.title ? classes.error : ''}`,
                }}
                value={values.title}
                onChange={handleInputChange('title')}
                placeholder="Введите название"
                radius={16}
                size="lg"
                error={errors.title}
              />
            </div>

            <div className={classes.inputGroup}>
              <div className={classes.labelRow}>
                <span className={classes.label}>Описание</span>
                <span className={classes.charCount}>
                  {values.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                classNames={{
                  input: `${classes.textarea} ${errors.description ? classes.error : ''}`,
                }}
                value={values.description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
                  handleChange('description', value);
                }}
                placeholder="Опишите вакансию или потребность в услуге"
                radius={16}
                size="lg"
                maxLength={MAX_DESCRIPTION_LENGTH}
                autosize
                minRows={3}
                maxRows={6}
                error={errors.description}
              />
            </div>

            <div className={classes.inputGroup}>
              <span className={classes.label}>Теги для поиска</span>
              <Select
                classNames={{ input: classes.select }}
                value={null}
                onChange={handleAddTag}
                onDropdownOpen={onTagsDropdownOpen}
                rightSection={
                  <div style={{ pointerEvents: 'none', display: 'flex' }}>
                    <ChevronDownIcon />
                  </div>
                }
                placeholder="Выберите из списка"
                data={availableTags}
                nothingFoundMessage={
                  tagsLoading ? (
                    <SpecializationsListSkeleton />
                  ) : (
                    'Ничего не найдено'
                  )
                }
                radius={16}
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
                  value={values.startDate}
                  onChange={(date) => handleChange('startDate', date)}
                  onIconClick={() => {
                    setTempDate(values.startDate || new Date());
                    openStartDate();
                  }}
                  onComplete={() => {
                    endDateRef.current?.focus();
                  }}
                  placeholder="__.__.____"
                  error={errors.startDate}
                />
                <span className={classes.dateSeparator}>-</span>
                <DateInput
                  ref={endDateRef}
                  value={values.endDate}
                  onChange={(date) => handleChange('endDate', date)}
                  onIconClick={() => {
                    setTempDate(values.endDate || new Date());
                    openEndDate();
                  }}
                  placeholder="__.__.____"
                  error={errors.endDate}
                />
              </div>
              {errors.endDate && (
                <div className={classes.errorText}>{errors.endDate}</div>
              )}
            </div>

            <div className={classes.inputGroup}>
              <span className={classes.label}>Бюджет</span>
              <TextInput
                classNames={{
                  input: `${classes.budgetInput} ${errors.budget ? classes.error : ''}`,
                }}
                value={values.budget}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleChange('budget', value);
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
                radius={16}
                size="lg"
                error={errors.budget}
              />
            </div>
          </div>

          <div className={classes.footer}>
            <ActionIcon
              onClick={onClose}
              variant="outline"
              size={48}
              radius="16"
            >
              <XIcon />
            </ActionIcon>
            <Button
              className={classes.submitButton}
              onClick={handleSubmit}
              loading={isSubmitting}
              radius="xl"
              variant="filled"
              fullWidth
              size="lg"
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
              c="var(--bg-color)"
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
              c="var(--bg-color)"
            >
              Готово
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
