import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { SpecializationsListSkeleton } from 'features/auth/ui/ProfileForm/SpecializationsList.skeleton';
import { PostType } from 'shared/api/service/Post/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { TagList } from 'shared/ui/TagList';
import classes from './PostForm.module.scss';
import { observer } from 'mobx-react-lite';

interface CityOption {
  value: string;
  label: string;
}

interface TagOption {
  value: string;
  label: string;
}

interface PostFormValues {
  title: string;
  description: string;
  type: PostType;
  tagIds: string[];
  cityId: string;
}

interface PostFormProps {
  values: PostFormValues;
  onChange: <K extends keyof PostFormValues>(
    field: K,
    value: PostFormValues[K],
  ) => void;
  citiesData: CityOption[];
  tagsData: TagOption[];
  onCitiesDropdownOpen?: () => void;
  onTagsDropdownOpen?: () => void;
  citiesLoading?: boolean;
  tagsLoading?: boolean;
}

const MAX_DESCRIPTION_LENGTH = 100;

export const PostForm = observer((props: PostFormProps) => {
  const {
    values,
    onChange,
    citiesData,
    tagsData,
    onCitiesDropdownOpen,
    onTagsDropdownOpen,
    citiesLoading,
    tagsLoading,
  } = props;

  const handleRemoveTag = (tagId: string) => {
    onChange(
      'tagIds',
      values.tagIds.filter((id) => id !== tagId),
    );
  };

  const handleAddTag = (tagId: string | null) => {
    if (tagId && !values.tagIds.includes(tagId)) {
      onChange('tagIds', [...values.tagIds, tagId]);
    }
  };

  const selectedTags = tagsData.filter((tag) =>
    values.tagIds.includes(tag.value),
  );

  const availableTags = tagsData.filter(
    (tag) => !values.tagIds.includes(tag.value),
  );

  return (
    <div className={classes.postForm}>
      <div className={classes.inputGroup}>
        <span className={classes.label}>Название</span>
        <TextInput
          classNames={{ input: classes.input }}
          value={values.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Введите название"
          radius={16}
          size="lg"
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
          classNames={{ input: classes.textarea }}
          value={values.description}
          onChange={(e) => {
            const value = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
            onChange('description', value);
          }}
          placeholder="Опишите свой проект или услугу"
          radius={16}
          size="lg"
          maxLength={MAX_DESCRIPTION_LENGTH}
          autosize
          minRows={3}
          maxRows={6}
        />
      </div>

      <div className={classes.typeSelector}>
        <Button
          className={`${classes.typeButton} ${values.type === 'project' ? classes.active : ''}`}
          onClick={() => onChange('type', 'project')}
          variant="filled"
          radius="xl"
        >
          Проект
        </Button>
        <Button
          className={`${classes.typeButton} ${values.type === 'service' ? classes.active : ''}`}
          onClick={() => onChange('type', 'service')}
          variant="filled"
          radius="xl"
        >
          Услуга
        </Button>
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
            tagsLoading ? <SpecializationsListSkeleton /> : 'Ничего не найдено'
          }
          radius={16}
          size="lg"
          searchable
          clearable={false}
        />
        <TagList tags={selectedTags} onRemove={handleRemoveTag} />
      </div>

      <div className={classes.inputGroup}>
        <span className={classes.label}>Город</span>
        <Select
          classNames={{ input: classes.select }}
          value={values.cityId}
          onChange={(val) => onChange('cityId', val || '')}
          onDropdownOpen={onCitiesDropdownOpen}
          rightSection={
            <div style={{ pointerEvents: 'none', display: 'flex' }}>
              <ChevronDownIcon />
            </div>
          }
          placeholder="Выберите из списка"
          data={citiesData}
          nothingFoundMessage={
            citiesLoading ? (
              <SpecializationsListSkeleton />
            ) : (
              'Ничего не найдено'
            )
          }
          radius={16}
          size="lg"
          searchable
          filter={({ options, search }) => {
            return options.filter((option: any) =>
              option.label?.toLowerCase().includes(search.toLowerCase().trim()),
            );
          }}
        />
      </div>
    </div>
  );
});
