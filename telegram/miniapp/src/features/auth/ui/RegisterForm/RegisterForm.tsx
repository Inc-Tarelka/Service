import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';

import { useStore } from 'app/StoreProvider';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { verificationStore } from 'shared/store/api/Verification/verification-store';
import { Page } from 'widgets/Page';
import { registerSchema } from '../../model/validation';

import s from './RegisterForm.module.scss';

interface RegisterFormProps {
  onSuccess: (data: any) => void;
  onNavigateToLogin: () => void;
}

export const RegisterForm = observer(
  ({ onSuccess, onNavigateToLogin }: RegisterFormProps) => {
    const { authStore } = useStore();

    const {
      values,
      errors,
      isSubmitting,
      handleChange,
      handleInputChange,
      handleSubmit,
    } = useFormWithValidation({
      initialValues: {
        phone: '',
        login: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false as any as true,
      },
      schema: registerSchema,
      onSubmit: async (values) => {
        const success = await verificationStore.sendCode(values.phone);
        if (success) {
          authStore.setTempData({
            phone: values.phone,
            login: values.login,
            password: values.password,
            verificationRequestId: verificationStore.requestId || '',
          });

          console.log('RegisterForm saved to tempData:', authStore.tempData);

          onSuccess({
            phone: values.phone,
            login: values.login,
            password: values.password,
            verificationRequestId: verificationStore.requestId,
          });
        }
      },
    });

    const handleRequestPhone = () => {
      WebApp.requestContact((success: boolean, response: any) => {
        if (success && response?.responseUnsafe?.contact?.phone_number) {
          let phoneNumber = response.responseUnsafe.contact.phone_number;
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
          }
          handleChange('phone', phoneNumber);
        } else {
          console.log('Phone request failed or cancelled');
        }
      });
    };

    return (
      <Page className={s.registerForm} smallPaddingBottom>
        <div className={s.content}>
          <h1 className={s.title}>Регистрация</h1>

          <div className={s.inputGroup}>
            <span className={s.label}>Телефон</span>
            <TextInput
              classNames={{
                input: `${s.input} ${errors.phone ? s.error : ''}`,
              }}
              value={values.phone}
              onChange={handleInputChange('phone')}
              placeholder="Получить из Telegram"
              rightSection={
                <div
                  onClick={handleRequestPhone}
                  style={{ cursor: 'pointer', display: 'flex' }}
                >
                  <ChevronRightIcon />
                </div>
              }
              radius="xl"
              size="lg"
              error={errors.phone}
            />
          </div>

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
            <span className={s.hint}>Это будет ваш уникальный никнейм</span>
          </div>

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

          <div className={s.termsWrapper}>
            <Checkbox
              className={s.termsCheckbox}
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
            color="var(--accent-light)"
          >
            Продолжить
          </Button>
        </div>
      </Page>
    );
  },
);
