import { Button, PasswordInput, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { loginRequest } from '../../api/authApi';
import { loginSchema } from '../../model/validation';

import { Page } from 'widgets/Page';
import s from './LoginForm.module.scss';

interface LoginFormProps {
  onSuccess: (data: { login: string; phone: string; token: string }) => void;
  onNavigateToRegister: () => void;
  onNavigateToReset: () => void;
}

export const LoginForm = observer(
  ({ onSuccess, onNavigateToRegister, onNavigateToReset }: LoginFormProps) => {
    const {
      values,
      errors,
      isSubmitting,
      handleInputChange,
      handleSubmit,
      setErrors,
    } = useFormWithValidation({
      initialValues: { login: '', password: '' },
      schema: loginSchema,
      onSubmit: async (values) => {
        try {
          const response = await loginRequest({
            phone: values.login,
            password: values.password,
          });

          if (response.success) {
            onSuccess({
              login: values.login,
              phone: '+79991234567',
              token: response.token,
            });
          }
        } catch (error) {
          console.error('Login error:', error);
          setErrors({ password: 'Неверный логин или пароль' });
        }
      },
    });

    return (
      <Page className={s.loginForm}>
        <div className={s.content}>
          <h1 className={s.title}>Вход в аккаунт</h1>

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

          <div className={s.inputGroup}>
            <div className={s.label}>
              <span>Пароль</span>
              <span className={s.forgotLink} onClick={onNavigateToReset}>
                Забыл пароль
              </span>
            </div>
            <PasswordInput
              classNames={{ input: s.input }}
              value={values.password}
              onChange={handleInputChange('password')}
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
            loading={isSubmitting}
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
