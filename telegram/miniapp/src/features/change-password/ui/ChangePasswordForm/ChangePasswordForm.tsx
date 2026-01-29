import { Button, PasswordInput } from '@mantine/core';
import { changePasswordSchema } from 'features/change-password/model/validation';
import { observer } from 'mobx-react-lite';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import s from './ChangePasswordForm.module.scss';

export const ChangePasswordForm = observer(() => {
  const { values, errors, handleInputChange, handleSubmit, isSubmitting } =
    useFormWithValidation({
      initialValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      schema: changePasswordSchema,
      onSubmit: async (values) => {
        console.log('Change password:', values);
        // TODO: Call API
      },
    });

  return (
    <form
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={s.card}>
        <p className={s.hint}>
          Пароль должен содержать не менее 8 символов, включая цифры, буквы и
          специальные символы (!$@%).
        </p>

        <div className={s.inputGroup}>
          <span className={s.label}>Текущий пароль</span>
          <PasswordInput
            classNames={{ input: s.input, innerInput: s.innerInput }}
            placeholder="Введите текущий пароль"
            radius="xl"
            size="lg"
            value={values.currentPassword}
            onChange={handleInputChange('currentPassword')}
            error={errors.currentPassword}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Новый пароль</span>
          <PasswordInput
            classNames={{ input: s.input, innerInput: s.innerInput }}
            placeholder="Придумайте новый пароль"
            radius="xl"
            size="lg"
            value={values.newPassword}
            onChange={handleInputChange('newPassword')}
            error={errors.newPassword}
          />
        </div>

        <div className={s.inputGroup}>
          <span className={s.label}>Повторите новый пароль</span>
          <PasswordInput
            classNames={{ input: s.input, innerInput: s.innerInput }}
            placeholder="Повторите новый пароль"
            radius="xl"
            size="lg"
            value={values.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        color="var(--accent-color)"
        style={{ color: 'var(--bg-color)' }}
        size="lg"
        radius="xl"
        className={s.submitButton}
        loading={isSubmitting}
      >
        Сохранить
      </Button>
    </form>
  );
});
