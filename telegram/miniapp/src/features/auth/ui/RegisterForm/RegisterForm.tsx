import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { Page } from 'widgets/Page';
import { AccountType } from '../../model/types';
import { registerSchema, validateForm } from '../../model/validation';

import s from './RegisterForm.module.scss';

interface RegisterFormProps {
  onSuccess: (data: {
    accountType: AccountType;
    login: string;
    password: string;
  }) => void;
  onNavigateToLogin: () => void;
}

export const RegisterForm = observer(
  ({ onSuccess, onNavigateToLogin }: RegisterFormProps) => {
    const [accountType, setAccountType] = useState<AccountType>('specialist');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
      const validation = validateForm(registerSchema, {
        accountType,
        login,
        password,
        confirmPassword,
        agreeToTerms,
      });

      if (!validation.success) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setIsLoading(true);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSuccess({
          accountType,
          login,
          password,
        });
      } catch (error) {
        console.error('Register error:', error);
        setErrors({ login: 'Ошибка регистрации' });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Page className={s.registerForm}>
        <div className={s.content}>
          <h1 className={s.title}>Регистрация</h1>

          <div className={s.typeSelector}>
            <Button
              className={`${s.typeButton} ${accountType === 'specialist' ? s.active : ''}`}
              onClick={() => setAccountType('specialist')}
              variant="outline"
              radius="xl"
            >
              Специалист
            </Button>
            <Button
              className={`${s.typeButton} ${accountType === 'company' ? s.active : ''}`}
              onClick={() => setAccountType('company')}
              variant="outline"
              radius="xl"
            >
              Компания
            </Button>
          </div>

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

          <div className={s.termsWrapper}>
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => {
                setAgreeToTerms(e.currentTarget.checked);
                setErrors((prev) => ({ ...prev, agreeToTerms: '' }));
              }}
              label={
                <>
                  Нажимая "Продолжить", вы соглашаетесь c{' '}
                  <span className={s.termsLink}>Правилами использования</span>
                </>
              }
              size="sm"
            />
            {errors.agreeToTerms && (
              <p className={s.termsError}>{errors.agreeToTerms}</p>
            )}
          </div>
        </div>

        <div className={s.footer}>
          <p className={s.loginLink}>
            Есть аккаунт? <span onClick={onNavigateToLogin}>Войти</span>
          </p>
          <Button
            className={s.submitButton}
            onClick={handleSubmit}
            loading={isLoading}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
          >
            Продолжить
          </Button>
        </div>
      </Page>
    );
  },
);
