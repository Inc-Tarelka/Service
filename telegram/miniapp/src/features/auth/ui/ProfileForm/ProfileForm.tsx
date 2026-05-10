import { Button, Select, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useStore } from 'app/StoreProvider';
import type { AccountType as ApiAccountType } from 'shared/api/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { Page } from 'widgets/Page';
import { profileSchema } from '../../model/validation';

import { CitiesListSkeleton } from './CitiesLIst.skeleton';
import s from './ProfileForm.module.scss';
import { SpecializationsListSkeleton } from './SpecializationsList.skeleton';
import WebApp from '@twa-dev/sdk';

interface ProfileFormProps {
  onSuccess: (data: any) => void;
}

const isProfileAccountType = (
  value?: string,
): value is 'specialist' | 'company' =>
  value === 'specialist' || value === 'company';

export const ProfileForm = observer(({ onSuccess }: ProfileFormProps) => {
  const { authStore, userStore } = useStore();

  const initialAccountType = isProfileAccountType(
    authStore.tempData.accountType,
  )
    ? authStore.tempData.accountType
    : 'specialist';

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
      accountType: initialAccountType,
      name: authStore.tempData.name ?? '',
      lastName: authStore.tempData.lastName ?? '',
      specialization: authStore.tempData.specialization ?? '',
      city: authStore.tempData.city ?? '',
    },
    schema: profileSchema,
    onSubmit: async (values) => {
      try {
        const cityId = parseInt(values.city);
        const specializationId = parseInt(values.specialization);

        if (isNaN(cityId) || isNaN(specializationId)) {
          setErrors({ name: 'Выберите город и специализацию' });
          return;
        }

        const {
          login,
          phone,
          password,
          accountType,
          verificationRequestId,
          verificationCode,
        } = authStore.tempData;

        if (
          !login ||
          !phone ||
          !password ||
          !verificationRequestId ||
          !verificationCode
        ) {
          setErrors({
            name: 'Данные сессии потеряны. Начните регистрацию заново.',
          });
          return;
        }

        const result = await authStore.telegramRegistrationAction({
          initData: WebApp.initData || '',
          account: {
            type:
              (accountType as unknown as ApiAccountType) ??
              ('PERSON' as ApiAccountType),
            username: login,
            phone,
            password,
          },
          phoneVerification: {
            verificationCode,
            verificationRequestId,
          },
          specializationIds: [specializationId],
          directionIds: [],
          cityIds: [cityId],
        });

        if (result === true) {
          await userStore.updateMyProfileAction({
            name: values.name,
            surname: values.lastName,
          });
          onSuccess(values);
        } else if (result === 'conflict') {
          setErrors({
            name: 'Аккаунт с такими данными уже существует. Проверьте логин и пароль и попробуйте снова.',
          });
        } else {
          setErrors({ name: 'Ошибка регистрации. Попробуйте снова.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ name: 'Ошибка регистрации' });
      }
    },
  });

  useEffect(() => {
    authStore.setTempData({
      accountType: values.accountType,
      name: values.name,
      lastName: values.lastName,
      specialization: values.specialization,
      city: values.city,
    });
  }, [
    authStore,
    values.accountType,
    values.name,
    values.lastName,
    values.specialization,
    values.city,
  ]);

  const isCompany = values.accountType === 'company';

  const specializationsData = referenceStore.specializations.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const citiesData = referenceStore.cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <Page className={s.profileForm} smallPaddingBottom>
      <div className={s.content}>
        <h1 className={s.title}>Расскажите о себе</h1>

        <div className={s.typeSelector}>
          <Button
            className={`${s.typeButton} ${values.accountType === 'specialist' ? s.active : ''} `}
            onClick={() => handleChange('accountType', 'specialist')}
            variant="filled"
            radius="xl"
          >
            Специалист
          </Button>
          <Button
            className={`${s.typeButton} ${values.accountType === 'company' ? s.active : ''} `}
            onClick={() => handleChange('accountType', 'company')}
            variant="filled"
            radius="xl"
          >
            Компания
          </Button>
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>
            {isCompany ? 'Название организации' : 'Имя (название организации)'}
          </span>
          <TextInput
            classNames={{ input: `${s.input} ${errors.name ? s.error : ''}` }}
            value={values.name}
            onChange={handleInputChange('name')}
            placeholder={isCompany ? 'Название компании' : 'Ваше имя'}
            error={errors.name}
            radius="xl"
            size="lg"
          />
        </div>

        <div className={s.inputGroup}>
          <div className={s.labelRow}>
            <span className={s.label}>Фамилия</span>
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

        <div className={s.inputGroup}>
          <span className={s.label}>Специализация</span>
          <Select
            classNames={{
              input: `${s.select} ${errors.specialization ? s.error : ''}`,
            }}
            value={values.specialization}
            onChange={(val) => handleChange('specialization', val)}
            onDropdownOpen={() => referenceStore.getSpecializationsAction()}
            rightSection={
              <div style={{ pointerEvents: 'none', display: 'flex' }}>
                <ChevronDownIcon />
              </div>
            }
            placeholder="Выберите специализацию"
            data={specializationsData}
            nothingFoundMessage={
              referenceStore.specializationsData?.state === 'pending' ? (
                <SpecializationsListSkeleton />
              ) : (
                'Ничего не найдено'
              )
            }
            error={errors.specialization}
            radius="xl"
            size="lg"
            searchable
            filter={({ options, search }) => {
              if (referenceStore.specializationsData?.state === 'pending')
                return options;
              return options.filter((option: any) =>
                option.label
                  ?.toLowerCase()
                  .includes(search.toLowerCase().trim()),
              );
            }}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Город</span>
          <Select
            classNames={{ input: `${s.select} ${errors.city ? s.error : ''}` }}
            value={values.city}
            onChange={(val) => handleChange('city', val)}
            onDropdownOpen={() => referenceStore.getCitiesAction()}
            rightSection={
              <div style={{ pointerEvents: 'none', display: 'flex' }}>
                <ChevronDownIcon />
              </div>
            }
            placeholder="Выберите город"
            data={citiesData}
            nothingFoundMessage={
              referenceStore.citiesData?.state === 'pending' ? (
                <CitiesListSkeleton />
              ) : (
                'Ничего не найдено'
              )
            }
            error={errors.city}
            radius="xl"
            size="lg"
            searchable
            filter={({ options, search }) => {
              if (referenceStore.citiesData?.state === 'pending')
                return options;
              return options.filter((option: any) =>
                option.label
                  ?.toLowerCase()
                  .includes(search.toLowerCase().trim()),
              );
            }}
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
          color={'var(--accent-light)'}
          variant="filled"
        >
          Создать аккаунт
        </Button>
      </div>
    </Page>
  );
});
