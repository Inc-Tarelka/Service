import { Button, Select, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { Page } from 'widgets/Page';
import { authStore } from '../../model/AuthStore';
import { CITIES, SPECIALIZATIONS } from '../../model/types';
import { profileSchema } from '../../model/validation';

import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import s from './ProfileForm.module.scss';

interface ProfileFormProps {
  onSuccess: (data: {
    name: string;
    lastName: string;
    nickname: string;
    specialization: string;
    city: string;
  }) => void;
}

export const ProfileForm = observer(({ onSuccess }: ProfileFormProps) => {
  const isCompany = authStore.isCompany;

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleInputChange,
    handleSubmit,
    setErrors,
  } = useFormWithValidation({
    initialValues: {
      name: '',
      lastName: '',
      nickname: '',
      specialization: 'Вариант по умолчанию',
      city: 'Москва',
    },
    schema: profileSchema,
    onSubmit: async (values) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSuccess({
          name: values.name,
          lastName: values.lastName || '',
          nickname: values.nickname,
          specialization: values.specialization || '',
          city: values.city || '',
        });
      } catch (error) {
        console.error('Profile error:', error);
        setErrors({ name: 'Ошибка сохранения профиля' });
      }
    },
  });

  return (
    <Page className={s.profileForm}>
      <div className={s.content}>
        <h1 className={s.title}>Расскажите о себе</h1>

        <div className={s.inputGroup}>
          <span className={s.label}>
            {isCompany ? 'Название организации' : 'Имя/Название организации'}
          </span>
          <TextInput
            classNames={{ input: s.input }}
            value={values.name}
            onChange={handleInputChange('name')}
            placeholder={isCompany ? 'Название компании' : 'Ваше имя'}
            error={errors.name}
            radius="xl"
            size="lg"
          />
        </div>

        {!isCompany && (
          <div className={s.inputGroup}>
            <div className={s.labelRow}>
              <span className={s.label}>Фамилия</span>
              <span className={s.optional}>(не обязательно)</span>
            </div>
            <TextInput
              classNames={{ input: s.input }}
              value={values.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Ваша фамилия"
              radius="xl"
              size="lg"
            />
          </div>
        )}

        <div className={s.inputGroup}>
          <span className={s.label}>Никнейм</span>
          <TextInput
            classNames={{ input: s.input }}
            value={values.nickname}
            onChange={handleInputChange('nickname')}
            placeholder="@никнейм"
            error={errors.nickname}
            radius="xl"
            size="lg"
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Специализация</span>
          <Select
            classNames={{ input: s.select }}
            value={values.specialization}
            onChange={(val) => handleChange('specialization', val)}
            rightSection={<ChevronDownIcon />}
            data={SPECIALIZATIONS}
            error={errors.specialization}
            radius="xl"
            size="lg"
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Город</span>
          <Select
            classNames={{ input: s.select }}
            value={values.city}
            rightSection={<ChevronDownIcon />}
            onChange={(val) => handleChange('city', val)}
            data={CITIES}
            error={errors.city}
            radius="xl"
            size="lg"
          />
        </div>
      </div>

      <div className={s.footer}>
        <Button
          className={s.submitButton}
          onClick={handleSubmit}
          loading={isSubmitting}
          fullWidth
          radius="xl"
          size="lg"
          color={'var(--accent-color)'}
          variant="filled"
        >
          Создать аккаунт
        </Button>
      </div>
    </Page>
  );
});
