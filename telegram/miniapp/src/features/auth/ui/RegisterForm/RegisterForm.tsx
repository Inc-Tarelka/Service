import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { Page } from 'widgets/Page';
import { AccountType } from '../../model/types';
import { registerSchema } from '../../model/validation';

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
    const {
      values,
      errors,
      isSubmitting,
      handleChange,
      handleInputChange,
      handleSubmit,
      setErrors,
    } = useFormWithValidation({
      initialValues: {
        accountType: 'specialist' as AccountType,
        login: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
      },
      schema: registerSchema,
      onSubmit: async (values) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          onSuccess({
            accountType: values.accountType,
            login: values.login,
            password: values.password,
          });
        } catch (error) {
          console.error('Register error:', error);
          setErrors({ login: 'Ошибка регистрации' });
        }
      },
    });

    return (
      <Page className={s.registerForm}>
        <div className={s.content}>
          <h1 className={s.title}>Регистрация</h1>

          <div className={s.typeSelector}>
            <Button
              className={`${s.typeButton} ${values.accountType === 'specialist' ? s.active : ''} `}
              onClick={() => handleChange('accountType', 'specialist')}
              variant="outline"
              radius="xl"
            >
              Специалист
            </Button>
            <Button
              className={`${s.typeButton} ${values.accountType === 'company' ? s.active : ''} `}
              onClick={() => handleChange('accountType', 'company')}
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
              value={values.login}
              onChange={handleInputChange('login')}
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

          <div className={s.termsWrapper}>
            <Checkbox
              checked={values.agreeToTerms}
              onChange={(e) =>
                handleChange('agreeToTerms', e.currentTarget.checked)
              }
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
            loading={isSubmitting}
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
