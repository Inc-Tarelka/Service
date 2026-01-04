import { Button, Select, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { Page } from 'widgets/Page';
import { authStore } from '../../model/AuthStore';
import { CITIES, SPECIALIZATIONS } from '../../model/types';
import { profileSchema, validateForm } from '../../model/validation';

import s from './ProfileForm.module.scss';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';

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
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [specialization, setSpecialization] = useState<string | null>(
    'Вариант по умолчанию',
  );
  const [city, setCity] = useState<string | null>('Москва');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCompany = authStore.isCompany;

  const handleSubmit = async () => {
    const validation = validateForm(profileSchema, {
      name,
      lastName: lastName || undefined,
      nickname,
      specialization: specialization || '',
      city: city || '',
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      onSuccess({
        name,
        lastName,
        nickname,
        specialization: specialization || '',
        city: city || '',
      });
    } catch (error) {
      console.error('Profile error:', error);
      setErrors({ name: 'Ошибка сохранения профиля' });
    } finally {
      setIsLoading(false);
    }
  };

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
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
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
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
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
            value={nickname}
            onChange={(e) => {
              setNickname(e.currentTarget.value);
              setErrors((prev) => ({ ...prev, nickname: '' }));
            }}
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
            value={specialization}
            onChange={setSpecialization}
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
            value={city}
            rightSection={<ChevronDownIcon />}
            onChange={setCity}
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
          loading={isLoading}
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
