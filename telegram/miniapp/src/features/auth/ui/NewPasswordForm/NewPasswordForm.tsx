import { Button, PasswordInput, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Page } from 'widgets/Page';

import { setNewPasswordRequest } from '../../api/authApi';
import { authStore } from '../../model/AuthStore';
import { newPasswordSchema, validateForm } from '../../model/validation';

import s from './NewPasswordForm.module.scss';

interface NewPasswordFormProps {
  onSuccess: (token?: string) => void;
}

export const NewPasswordForm = observer(
  ({ onSuccess }: NewPasswordFormProps) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
      const validation = validateForm(newPasswordSchema, {
        password,
        confirmPassword,
      });

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setIsLoading(true);

      try {
        const response = await setNewPasswordRequest({
          token: authStore.tempData.resetToken || '',
          password,
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
      } finally {
        setIsLoading(false);
      }
    };

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
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
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
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
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
            loading={isLoading}
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
