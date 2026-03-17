import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { SearchUserDrawer } from 'features/post/ui/SearchUserDrawer/SearchUserDrawer';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { FindWorkStatus } from 'shared/api/service/User/types';
import type { CoauthorSearchUser } from 'shared/api/service/UserSearch/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import XIcon from 'shared/assets/icons/x';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { editProfileSchema } from '../../model/validation';
import { CitySelect } from './CitySelect';
import s from './EditProfileForm.module.scss';
import { SpecializationSelect } from './SpecializationSelect';

const FIND_WORK_OPTIONS = [
  { label: 'Активно ищу', value: 'LOOKING' },
  { label: 'Рассматриваю предложения', value: 'OPEN_TO_OFFERS' },
  { label: 'Не ищу', value: 'NOT_LOOKING' },
] as const;

const mapFindWork = (val?: string): string | undefined => {
  const found = FIND_WORK_OPTIONS.find((o) => o.value === val);
  return found ? found.label : undefined;
};

const mapToApiStatus = (label?: string): FindWorkStatus | undefined => {
  const found = FIND_WORK_OPTIONS.find((o) => o.label === label);
  return found?.value as FindWorkStatus | undefined;
};

export const EditProfileForm = observer(() => {
  const { userStore } = useStore();
  const profile = userStore.profile;
  const [
    masterSearchOpened,
    { open: openMasterSearch, close: closeMasterSearch },
  ] = useDisclosure(false);
  const [selectedMaster, setSelectedMaster] =
    useState<CoauthorSearchUser | null>(null);

  const {
    values,
    errors,
    handleChange,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    setValues,
  } = useFormWithValidation({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      city: '',
      about: '',
      education: '',
      specialization: '',
      searchStatus: '',
    },
    schema: editProfileSchema,
    onSubmit: async (vals) => {
      if (!profile) return;
      const payload: Record<string, unknown> = {
        username: vals.username,
        bio: vals.about,
        education: vals.education,
      };
      const apiStatus = mapToApiStatus(vals.searchStatus);
      if (apiStatus) payload.find_work = apiStatus;
      await userStore.updateProfileAction(
        payload as Parameters<typeof userStore.updateProfileAction>[0],
        profile.id as number,
      );
    },
  });

  useEffect(() => {
    referenceStore.getCitiesAction();
    referenceStore.getSpecializationsAction();
  }, []);

  useEffect(() => {
    if (profile) {
      setValues({
        firstName: profile.firstName ?? profile.person?.name ?? '',
        lastName: profile.lastName ?? profile.person?.surname ?? '',
        username: profile.username ?? '',
        city: String(profile.cities?.[0]?.id ?? ''),
        about: profile.about ?? profile.bio ?? '',
        education: profile.education ?? '',
        specialization: String(profile.specializations?.[0]?.id ?? ''),
        searchStatus: mapFindWork(profile.find_work) ?? '',
      });
    }
  }, [profile, setValues]);

  return (
    <>
      <div className={s.form}>
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Личная информация</h2>

          <div className={s.inputGroup}>
            <span className={s.label}>Имя</span>
            <TextInput
              placeholder="Ваше имя"
              radius="xl"
              size="lg"
              value={values.firstName}
              onChange={handleInputChange('firstName')}
              error={errors.firstName}
            />
          </div>

          <div className={s.inputGroup}>
            <span className={s.label}>Фамилия</span>
            <TextInput
              placeholder="Ваша фамилия"
              radius="xl"
              size="lg"
              value={values.lastName}
              onChange={handleInputChange('lastName')}
              error={errors.lastName}
            />
          </div>

          <div className={s.inputGroup}>
            <span className={s.label}>Логин</span>
            <TextInput
              placeholder="Введите логин"
              radius="xl"
              size="lg"
              value={values.username}
              onChange={handleInputChange('username')}
              error={errors.username}
            />
          </div>

          <div className={s.inputGroup}>
            <CitySelect
              value={values.city}
              onChange={(cityId) => handleChange('city', cityId)}
              error={errors.city}
            />
          </div>

          <div className={s.inputGroup}>
            <div className={s.labelRow}>
              <span className={s.label}>О себе</span>
              <span className={s.counter}>
                {(values.about || '').length}/250
              </span>
            </div>
            <Textarea
              placeholder="Расскажите о себе"
              radius={24}
              size="lg"
              autosize
              minRows={3}
              maxRows={10}
              maxLength={250}
              value={values.about || ''}
              onChange={(e) => handleChange('about', e.currentTarget.value)}
              error={errors.about}
            />
          </div>
        </div>

        <div className={s.section}>
          <h2 className={s.sectionTitle}>Специализация</h2>
          <SpecializationSelect
            value={values.specialization}
            onChange={(specializationId) =>
              handleChange('specialization', specializationId)
            }
            error={errors.specialization}
          />

          <div className={s.inputGroup}>
            <span className={s.label}>Статус по поиску работы</span>
            <Select
              placeholder="Выберите статус"
              data={FIND_WORK_OPTIONS.map((o) => o.label)}
              radius="xl"
              size="lg"
              value={values.searchStatus}
              onChange={(val) => handleChange('searchStatus', val)}
              error={errors.searchStatus}
              rightSection={
                <div style={{ pointerEvents: 'none', display: 'flex' }}>
                  <ChevronDownIcon />
                </div>
              }
            />
          </div>

          <div className={s.inputGroup}>
            <span className={s.label}>Образование</span>
            <TextInput
              placeholder="Укажите ваше образование"
              radius="xl"
              size="lg"
              value={values.education}
              onChange={handleInputChange('education')}
              error={errors.education}
            />
          </div>
        </div>

        <div className={s.section}>
          <div className={s.inputGroup}>
            <span className={s.label}>мастер</span>
            {selectedMaster ? (
              <TextInput
                readOnly
                radius="xl"
                size="lg"
                value={`${selectedMaster.name} ${selectedMaster.surname}`.trim()}
                rightSection={
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-color-secondary)',
                      fontSize: 18,
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onClick={() => setSelectedMaster(null)}
                  >
                    <XIcon />
                  </button>
                }
                onClick={openMasterSearch}
              />
            ) : (
              <Button
                variant="outline"
                radius="xl"
                size="lg"
                fullWidth
                onClick={openMasterSearch}
                styles={{
                  root: {
                    borderColor: 'var(--card-bg)',
                    color: 'var(--text-color-secondary)',
                    backgroundColor: 'var(--tertiary-bg-color)',
                  },
                }}
              >
                Выбрать мастера
              </Button>
            )}
          </div>
        </div>

        <div className={s.footer}>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || userStore.isUpdatingProfile}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
            bg="var(--accent-color)"
            c="var(--bg-color)"
          >
            {isSubmitting || userStore.isUpdatingProfile
              ? 'Сохранение...'
              : 'Сохранить'}
          </Button>
        </div>
      </div>

      <SearchUserDrawer
        opened={masterSearchOpened}
        onClose={closeMasterSearch}
        onUserSelect={(user) => {
          setSelectedMaster(user);
          closeMasterSearch();
        }}
      />
    </>
  );
});
