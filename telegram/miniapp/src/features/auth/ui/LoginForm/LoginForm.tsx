import { Button, PasswordInput, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { useStore } from 'app/StoreProvider';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { Page } from 'widgets/Page';
import { loginSchema } from '../../model/validation';
import s from './LoginForm.module.scss';

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
  onNavigateToReset: () => void;
}

export const LoginForm = observer(
  ({ onSuccess, onNavigateToRegister, onNavigateToReset }: LoginFormProps) => {
    const { authStore } = useStore();
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
          const success = await authStore.loginAction({
            username: values.login,
            password: values.password,
          });

          if (success) {
            onSuccess();
          } else {
            setErrors({ password: 'Неверный логин или пароль' });
          }
        } catch (error) {
          // Логируем критическую ошибку входа
          console.error('Login failed unexpectedly:', error);
          setErrors({ password: 'Произошла непредвиденная ошибка' });
        }
      },
    });

    return (
      <Page className={s.loginForm} smallPaddingBottom>
        <div className={s.content}>
          <h1 className={s.title}>Вход в аккаунт</h1>

          <div className={s.inputGroup}>
            <span className={s.label}>Логин</span>
            <TextInput
              classNames={{
                input: `${s.input} ${errors.login ? s.error : ''}`,
              }}
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
              classNames={{
                input: `${s.input} ${errors.password ? s.error : ''}`,
              }}
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
