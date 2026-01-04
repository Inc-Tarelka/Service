import { Button, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Page } from 'widgets/Page';

import { resetPasswordRequest } from '../../api/authApi';
import { resetSchema, validateForm } from '../../model/validation';

import s from './PasswordResetForm.module.scss';

interface PasswordResetFormProps {
  onSuccess: (data: { login: string; phone: string; token: string }) => void;
}

export const PasswordResetForm = observer(
  ({ onSuccess }: PasswordResetFormProps) => {
    const [login, setLogin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
      const validation = validateForm(resetSchema, { login });

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setIsLoading(true);

      try {
        const response = await resetPasswordRequest({ phone: login });

        if (response.success) {
          onSuccess({
            login,
            phone: '+79991234567',
            token: response.token,
          });
        }
      } catch (error) {
        console.error('Reset error:', error);
        setErrors({ login: 'Пользователь не найден' });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Page className={s.passwordResetForm}>
        <div className={s.content}>
          <h1 className={s.title}>Восстановление пароля</h1>

          <div className={s.inputGroup}>
            <span className={s.label}>Логин</span>
            <TextInput
              classNames={{ input: s.input }}
              value={login}
              onChange={(e) => {
                setLogin(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, login: '' }));
              }}
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
            loading={isLoading}
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
