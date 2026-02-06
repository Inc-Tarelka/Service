import { Button, Select, Textarea, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { editProfileSchema } from '../../model/validation';
import s from './EditProfileForm.module.scss';

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
      education: '',
      searchStatus: '',
    },
    schema: editProfileSchema,
    onSubmit: async (values) => {
      console.log('Save profile:', values);
      // TODO: Call API/Store
    },
  });

  return (
    <div className={s.form}>
      <div className={s.card}>
        <h3 className={s.cardTitle}>Личная информация</h3>

        <div className={s.inputGroup}>
          <span className={s.label}>Имя</span>
          <TextInput
            classNames={{ input: s.input }}
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
            classNames={{ input: s.input }}
            placeholder="Ваша фамилия"
            radius="xl"
            size="lg"
            value={values.lastName}
            onChange={handleInputChange('lastName')}
            error={errors.lastName}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Никнейм</span>
          <TextInput
            classNames={{ input: s.input }}
            placeholder="@nickname"
            radius="xl"
            size="lg"
            value={values.username}
            onChange={handleInputChange('username')}
            error={errors.username}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Город</span>
          <TextInput
            classNames={{ input: s.input }}
            placeholder="Выберите город"
            radius="xl"
            size="lg"
            value={values.city}
            onChange={handleInputChange('city')}
            error={errors.city}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>О себе</span>
          <Textarea
            classNames={{ input: s.textarea }}
            placeholder="Расскажите о себе"
            radius="lg"
            minRows={3}
            value={values.about}
            onChange={(e) => handleChange('about', e.currentTarget.value)}
            error={errors.about}
          />
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Специализация</h3>
        <p className={s.placeholder}>Выбор специализации</p>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Образование</h3>
        <div className={s.inputGroup}>
          <span className={s.label}>Учебное заведение</span>
          <TextInput
            classNames={{ input: s.input }}
            placeholder="Укажите ВУЗ"
            radius="xl"
            size="lg"
            value={values.education}
            onChange={handleInputChange('education')}
            error={errors.education}
          />
        </div>
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>Статус по поиску работы</h3>
        <Select
          classNames={{ input: s.input }}
          placeholder="Выберите статус"
          data={['Активно ищу', 'Рассматриваю предложения', 'Не ищу']}
          radius="xl"
          size="lg"
          value={values.searchStatus}
          onChange={(val) => handleChange('searchStatus', val)}
          error={errors.searchStatus}
        />
      </div>

      <Button
        onClick={handleSubmit}
        fullWidth
        size="lg"
        radius="xl"
        className={s.submitButton}
        loading={isSubmitting}
      >
        Сохранить
      </Button>
    </div>
  );
});
