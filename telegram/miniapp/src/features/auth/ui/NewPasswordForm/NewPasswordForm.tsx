import { Button, PasswordInput, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Page } from 'widgets/Page';

import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { authStore } from '../../model/AuthStore';
import { newPasswordSchema } from '../../model/validation';

import s from './NewPasswordForm.module.scss';
import { setNewPasswordRequest } from 'shared/api/service/Auth/api';

interface NewPasswordFormProps {
  onSuccess: (token?: string) => void;
}

export const NewPasswordForm = observer(
  ({ onSuccess }: NewPasswordFormProps) => {
    const {
      values,
      errors,
      isSubmitting,
      handleInputChange,
      handleSubmit,
      setErrors,
    } = useFormWithValidation({
      initialValues: { password: '', confirmPassword: '' },
      schema: newPasswordSchema,
      onSubmit: async (values) => {
        try {
          const response = await setNewPasswordRequest({
            token: authStore.tempData.resetToken || '',
            password: values.password,
          });

          if (response.success) {
            onSuccess(response.token);
          } else {
            setErrors({
              password: response.message || 'Ошибка сохранения пароля',
            });
          }
        } catch (error) {
          console.error('Set password error:', error);
          setErrors({ password: 'Ошибка сохранения пароля' });
        }
      },
    });

    return (
      <Page className={s.newPasswordForm}>
        <div className={s.content}>
          <h1 className={s.title}>Новый пароль</h1>
          <Text className={s.subtitle}>
            Пароль должен содержать не менее 8 символов, включая цифры, буквы и
            специальные символы (!$@%).
          </Text>

          <div className={s.inputGroup}>
            <span className={s.label}>Пароль</span>
            <PasswordInput
              classNames={{ input: s.input }}
              value={values.password}
              onChange={handleInputChange('password')}
              placeholder="Минимум 8 символов"
              error={errors.password}
              radius="xl"
              size="lg"
            />
          </div>

          <div className={s.inputGroup}>
            <span className={s.label}>Повторите пароль</span>
            <PasswordInput
              classNames={{ input: s.input }}
              value={values.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              placeholder="Повторите пароль"
              error={errors.confirmPassword}
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
            Готово
          </Button>
        </div>
      </Page>
    );
  },
);
