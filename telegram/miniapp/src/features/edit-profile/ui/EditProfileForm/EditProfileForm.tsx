import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {
  FindWorkStatus,
  UpdateMyProfileRequest,
  User,
} from 'shared/api/service/User/types';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';
import XIcon from 'shared/assets/icons/x';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { editProfileSchema } from '../../model/validation';
import { CitySelect } from './CitySelect';
import s from './EditProfileForm.module.scss';
import {
  MasterSearchDrawer,
  MasterSelection,
} from '../MasterSearchDrawer/MasterSearchDrawer';
import { SpecializationSelect } from './SpecializationSelect';

const FIND_WORK_OPTIONS = [
  { label: 'Активно ищу', value: 'LOOKING' },
  { label: 'Рассматриваю предложения', value: 'OPEN_TO_OFFERS' },
  { label: 'Не ищу', value: 'NOT_LOOKING' },
] as const;

const mapFindWork = (val?: string): string | undefined => {
  const found = FIND_WORK_OPTIONS.find((option) => option.value === val);
  return found ? found.label : undefined;
};

const mapToApiStatus = (label?: string): FindWorkStatus | undefined => {
  const found = FIND_WORK_OPTIONS.find((option) => option.label === label);
  return found?.value as FindWorkStatus | undefined;
};

const mapProfileMaster = (profile: User): MasterSelection | null => {
  if (!profile.master?.name) {
    return null;
  }

  if (profile.master.isTarelkaUser) {
    return {
      type: 'tarelka',
      id: profile.master.id,
      name: profile.master.name,
    };
  }

  return {
    type: 'custom',
    name: profile.master.name,
  };
};

export const EditProfileForm = observer(() => {
  const { userStore, profileEditorStore } = useStore();
  const profile = userStore.profile;
  const masterSearchOpened = profileEditorStore.masterSearchOpened;
  const [selectedMaster, setSelectedMaster] = useState<MasterSelection | null>(
    null,
  );

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
      const payload: UpdateMyProfileRequest = {
        name: vals.firstName.trim(),
        surname: vals.lastName?.trim() ?? '',
        username: vals.username.trim(),
        bio: vals.about?.trim() ?? '',
        education: vals.education?.trim() ?? '',
      };

      const cityId = Number.parseInt(vals.city, 10);
      if (!Number.isNaN(cityId)) {
        payload.cityIds = [cityId];
      }

      const specializationId = Number.parseInt(vals.specialization ?? '', 10);
      if (!Number.isNaN(specializationId)) {
        payload.specializationIds = [specializationId];
      }

      const apiStatus = mapToApiStatus(vals.searchStatus);
      if (apiStatus) {
        payload.find_work = apiStatus;
      }

      if (selectedMaster?.type === 'tarelka') {
        payload.isMasterFromTable = false;
        payload.masterId = selectedMaster.id;
      }

      if (selectedMaster?.type === 'custom' && selectedMaster.name.trim()) {
        payload.isMasterFromTable = true;
        payload.masterName = selectedMaster.name.trim();
      }

      const success = await userStore.updateMyProfileAction(payload);
      if (success) {
        await userStore.getProfileAction();
        await userStore.getMyExtendedProfileAction();
      }
    },
  });

  useEffect(() => {
    referenceStore.getCitiesAction();
    referenceStore.getSpecializationsAction();
  }, []);

  useEffect(() => {
    return () => {
      profileEditorStore.closeMasterSearch();
    };
  }, [profileEditorStore]);

  useEffect(() => {
    if (!profile) {
      setSelectedMaster(null);
      return;
    }

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

    setSelectedMaster(mapProfileMaster(profile));
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
              onChange={(event) =>
                handleChange('about', event.currentTarget.value)
              }
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
              data={FIND_WORK_OPTIONS.map((option) => option.label)}
              radius="xl"
              size="lg"
              value={values.searchStatus}
              onChange={(value) => handleChange('searchStatus', value)}
              error={errors.searchStatus}
              comboboxProps={{ withinPortal: false }}
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
            <span className={s.label}>Мастер</span>
            <TextInput
              readOnly
              radius="xl"
              size="lg"
              placeholder="Выберите в Тарелке или введите имя"
              value={selectedMaster?.name ?? ''}
              onFocus={(event) => event.currentTarget.blur()}
              onMouseDown={(event) => event.preventDefault()}
              onClick={profileEditorStore.openMasterSearch}
              styles={{ input: { cursor: 'pointer' } }}
              rightSection={
                selectedMaster ? (
                  <button
                    type="button"
                    style={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-color-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedMaster(null);
                    }}
                  >
                    <XIcon />
                  </button>
                ) : (
                  <div style={{ pointerEvents: 'none', display: 'flex' }}>
                    <ChevronDownIcon />
                  </div>
                )
              }
            />
          </div>
        </div>

        <div className={s.buttonContainer}>
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

      <MasterSearchDrawer
        opened={masterSearchOpened}
        value={selectedMaster}
        onClose={profileEditorStore.closeMasterSearch}
        onChange={setSelectedMaster}
      />
    </>
  );
});
