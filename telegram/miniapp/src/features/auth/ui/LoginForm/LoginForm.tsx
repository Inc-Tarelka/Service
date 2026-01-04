import { Button, PasswordInput, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { loginRequest } from '../../api/authApi';
import { loginSchema, validateForm } from '../../model/validation';

import s from './LoginForm.module.scss';
import { Page } from 'widgets/Page';

interface LoginFormProps {
  onSuccess: (data: { login: string; phone: string; token: string }) => void;
  onNavigateToRegister: () => void;
  onNavigateToReset: () => void;
}

export const LoginForm = observer(
  ({ onSuccess, onNavigateToRegister, onNavigateToReset }: LoginFormProps) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
      const validation = validateForm(loginSchema, { login, password });

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setIsLoading(true);

      try {
        const response = await loginRequest({ phone: login, password });

        if (response.success) {
          onSuccess({
            login,
            phone: '+79991234567',
            token: response.token,
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ password: 'Неверный логин или пароль' });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Page className={s.loginForm}>
        <div className={s.content}>
          <h1 className={s.title}>Вход в аккаунт</h1>

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

          <div className={s.inputGroup}>
            <div className={s.label}>
              <span>Пароль</span>
              <span className={s.forgotLink} onClick={onNavigateToReset}>
                Забыл пароль
              </span>
            </div>
            <PasswordInput
              classNames={{ input: s.input }}
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="Введите пароль"
              error={errors.password}
              radius="xl"
              size="lg"
            />
          </div>
        </div>

        <div className={s.footer}>
          <p className={s.registerLink}>
            Ещё нет аккаунта?{' '}
            <span onClick={onNavigateToRegister}>Зарегистрироваться</span>
          </p>
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
            Войти
          </Button>
        </div>
      </Page>
    );
  },
);
