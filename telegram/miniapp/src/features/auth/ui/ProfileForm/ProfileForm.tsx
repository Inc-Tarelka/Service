import { Button, Select, TextInput } from '@mantine/core';
import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';

import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { Page } from 'widgets/Page';
import { authStore as wizardStore } from '../../model/AuthStore';
import { AccountType } from '../../model/types';
import { profileSchema } from '../../model/validation';

import { useStore } from 'app/StoreProvider';
import { CitiesListSkeleton } from './CitiesLIst.skeleton';
import s from './ProfileForm.module.scss';
import { SpecializationsListSkeleton } from './SpecializationsList.skeleton';

interface ProfileFormProps {
  onSuccess: (data: any) => void;
}

export const ProfileForm = observer(({ onSuccess }: ProfileFormProps) => {
  const { authStore } = useStore();

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
      accountType: 'specialist' as AccountType,
      name: '',
      lastName: '',
      specialization: '',
      city: '',
    },
    schema: profileSchema,
    onSubmit: async (values) => {
      try {
        const wizardData = wizardStore.tempData;

        if (
          !wizardData.login ||
          !wizardData.password ||
          !wizardData.phone ||
          !wizardData.verificationCode ||
          !wizardData.verificationRequestId
        ) {
          console.error('Missing wizard data', wizardData);
          setErrors({ name: 'Данные регистрации неполные. Вернитесь назад.' });
          return;
        }

        const type = values.accountType === 'company' ? 'COMPANY' : 'PERSON';

        const accountData: any = {
          type: type as any,
          username: wizardData.login,
          password: wizardData.password,
          phone: wizardData.phone,
        };

        if (values.accountType === 'company') {
          accountData.companyName = values.name;
          accountData.name = values.name;
        } else {
          accountData.name = values.name;
          accountData.surname = values.lastName;
        }

        const cityId = parseInt(values.city);
        const specializationId = parseInt(values.specialization);

        if (isNaN(cityId) || isNaN(specializationId)) {
          console.error('Invalid ID selection');
          return;
        }

        const success = await authStore.registerAction({
          account: accountData,
          cityIds: [cityId],
          directionIds: [],
          specializationIds: [specializationId],
          initData: WebApp.initData || '',
          phoneVerification: {
            verificationCode: wizardData.verificationCode,
            verificationRequestId: wizardData.verificationRequestId,
          },
        });

        if (success) {
          onSuccess(values);
        }
      } catch (error) {
        console.error('Profile error:', error);
        setErrors({ name: 'Ошибка сохранения профиля' });
      }
    },
  });

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
          <span className={s.label}>Специализация</span>
          <Select
            classNames={{ input: s.select }}
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
            classNames={{ input: s.select }}
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
