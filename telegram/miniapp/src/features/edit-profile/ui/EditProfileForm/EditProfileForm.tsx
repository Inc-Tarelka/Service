import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { editProfileSchema } from '../../model/validation';
import s from './EditProfileForm.module.scss';
import { CitySelect } from './CitySelect';
import { SpecializationSelect } from './SpecializationSelect';
import ChevronDownIcon from 'shared/assets/icons/chevronDown';

export const EditProfileForm = observer(() => {
  const {
    values,
    errors,
    handleChange,
    handleInputChange,
    handleSubmit,
    isSubmitting,
  } = useFormWithValidation({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      city: '',
      about: '',
    },
    schema: editProfileSchema,
    onSubmit: async (values) => {
      console.log('Save profile:', values);
      // TODO: Call API/Store
    },
  });

  return (
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
            <span className={s.counter}>{(values.about || '').length}/250</span>
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
            data={['Активно ищу', 'Рассматриваю предложения', 'Не ищу']}
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

      <div className={s.footer}>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          fullWidth
          radius="xl"
          variant="filled"
          size="lg"
          bg="var(--accent-color)"
          c="var(--bg-color)"
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
});
