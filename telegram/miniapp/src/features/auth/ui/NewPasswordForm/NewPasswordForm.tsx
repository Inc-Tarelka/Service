import { Button, PasswordInput, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'widgets/Page';

import { useStore } from 'app/StoreProvider';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { newPasswordSchema } from '../../model/validation';
import s from './NewPasswordForm.module.scss';

interface NewPasswordFormProps {
  onSuccess: (token?: string) => void;
}

export const NewPasswordForm = observer(
  ({ onSuccess }: NewPasswordFormProps) => {
    const { authStore } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
      const { login, verificationCode, verificationRequestId } =
        authStore.tempData;

      console.log('NewPasswordForm mounted with tempData:', authStore.tempData);

      if (!login || !verificationCode || !verificationRequestId) {
        console.error('Missing required data, redirecting to reset');
        navigate(RoutePath.auth + '?step=reset', { replace: true });
      }
    }, [authStore.tempData, navigate]);

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
        const { login, verificationCode, verificationRequestId } =
          authStore.tempData;

        console.log('Submitting reset with:', {
          login,
          verificationCode,
          verificationRequestId,
        });

        if (!login || !verificationCode || !verificationRequestId) {
          setErrors({ password: 'Не верные данные для сброса' });
          return;
        }

        const resetSuccess = await authStore.resetPasswordAction({
          newPassword: values.password,
          username: login,
          verificationCode: verificationCode,
          verificationRequestId: verificationRequestId,
        });

        console.log('Reset password success:', resetSuccess);

        if (!resetSuccess) {
          setErrors({ password: 'Ошибка смены пароля' });
          return;
        }

        const loginSuccess = await authStore.loginAction({
          username: login,
          password: values.password,
        });

        console.log('Auto-login success:', loginSuccess);
        console.log('Token after login:', authStore.token);

        if (loginSuccess) {
          const token = authStore.token;
          console.log('Calling onSuccess with token:', token);
          onSuccess(token || undefined);
        } else {
          console.log('Login failed, calling onSuccess without token');
          onSuccess();
        }
      },
    });

    return (
      <Page className={s.newPasswordForm} smallPaddingBottom>
        <div className={s.content}>
          <h1 className={s.title}>Новый пароль</h1>
          <Text className={s.subtitle}>
            Пароль должен содержать не менее 8 символов, включая цифры, буквы и
            специальные символы (!$@%).
          </Text>

          <div className={s.inputGroup}>
            <span className={s.label}>Пароль</span>
            <PasswordInput
              classNames={{
                input: `${s.input} ${errors.password ? s.error : ''}`,
              }}
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
              classNames={{
                input: `${s.input} ${errors.confirmPassword ? s.error : ''}`,
              }}
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
