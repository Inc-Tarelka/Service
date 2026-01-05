import { Button, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Page } from 'widgets/Page';

import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { resetPasswordRequest } from '../../api/authApi';
import { resetSchema } from '../../model/validation';

import s from './PasswordResetForm.module.scss';

interface PasswordResetFormProps {
  onSuccess: (data: { login: string; phone: string; token: string }) => void;
}

export const PasswordResetForm = observer(
  ({ onSuccess }: PasswordResetFormProps) => {
    const {
      values,
      errors,
      isSubmitting,
      handleInputChange,
      handleSubmit,
      setErrors,
    } = useFormWithValidation({
      initialValues: { login: '' },
      schema: resetSchema,
      onSubmit: async (values) => {
        try {
          const response = await resetPasswordRequest({ phone: values.login });

          if (response.success) {
            onSuccess({
              login: values.login,
              phone: '+79991234567',
              token: response.token,
            });
          }
        } catch (error) {
          console.error('Reset error:', error);
          setErrors({ login: 'Пользователь не найден' });
        }
      },
    });

    return (
      <Page className={s.passwordResetForm}>
        <div className={s.content}>
          <h1 className={s.title}>Восстановление пароля</h1>

          <div className={s.inputGroup}>
            <span className={s.label}>Логин</span>
            <TextInput
              classNames={{ input: s.input }}
              value={values.login}
              onChange={handleInputChange('login')}
              placeholder="Введите логин"
              error={errors.login}
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
            variant="filled"
            size="lg"
          >
            Выслать код
          </Button>
        </div>
      </Page>
    );
  },
);
