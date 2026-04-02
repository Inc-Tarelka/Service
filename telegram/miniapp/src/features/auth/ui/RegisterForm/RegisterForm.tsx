import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';

import { useStore } from 'app/StoreProvider';
import { AccountType } from 'shared/api/types';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
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
        const success = await authStore.preRegisterAndSendCodeAction({
          initData:
            'query_id=AAEf3kQfAAAAAB_eRB_s5YZ4&user=%7B%22id%22%3A524607007%2C%22first_name%22%3A%22%D0%98%D0%BB%D1%8C%D1%8F%22%2C%22last_name%22%3A%22%D0%9A%D0%B8%D1%81%D0%B5%D0%BB%D1%91%D0%B2%22%2C%22username%22%3A%22Vegetablefinder%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FvB29BixlKdczdf4UGp8tEIq7GmZ1UMlOO0vrGwdljmE.svg%22%7D&auth_date=1775077586&signature=eCepqLfGEd6RGqcibWWPBLfk77z_9esICxwXg_mnfIt19Inob6CAPqLoW3fZL0Ye85pNz-CMaLjeNm-_LxFPBw&hash=f63275a5c831aad9a1da114272365ea60b4056db7a58796070c5d58183690bc5',
          account: {
            type: AccountType.PERSON,
            username: values.login,
            phone: values.phone,
            password: values.password,
          },
        });

        if (success) {
          authStore.setTempData({
            phone: values.phone,
            login: values.login,
            password: values.password,
            accountType: AccountType.PERSON,
          });

          onSuccess({
            phone: values.phone,
            login: values.login,
            password: values.password,
            verificationRequestId: authStore.tempData.verificationRequestId,
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
          {WebApp.initDataUnsafe?.start_param && (
            <div className={s.referralHint}>Регистрация по приглашению</div>
          )}

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
              classNames={{
                input: errors.agreeToTerms ? s.checkboxError : '',
              }}
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
