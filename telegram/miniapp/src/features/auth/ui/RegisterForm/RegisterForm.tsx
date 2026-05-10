import { Button, Checkbox, PasswordInput, TextInput } from '@mantine/core';
import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';

import { useStore } from 'app/StoreProvider';
import { AccountType } from 'shared/api/types';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { TermsDrawer } from '../TermsDrawer/TermsDrawer';
import {
  buildTelegramStartAppLink,
  getReferralSenderIdFromInviteLink,
  getStoredReferralInviteLink,
} from 'shared/lib/utils/telegram-startapp';
import { Page } from 'widgets/Page';
import { registerSchema } from '../../model/validation';

import s from './RegisterForm.module.scss';

interface RegisterSuccessPayload {
  phone: string;
  login: string;
  password: string;
  verificationRequestId?: string;
}

interface RegisterFormProps {
  onSuccess: (data: RegisterSuccessPayload) => void;
  onNavigateToLogin: () => void;
}

export const RegisterForm = observer(
  ({ onSuccess, onNavigateToLogin }: RegisterFormProps) => {
    const { authStore } = useStore();
    const [inviteLink, setInviteLink] = useState('');
    const [termsOpened, setTermsOpened] = useState(false);
    const parsedInviteSenderId = useMemo(
      () => getReferralSenderIdFromInviteLink(inviteLink),
      [inviteLink],
    );
    const hasStoredInvite = authStore.hasRegistrationSenderId;
    const isInviteLocked = hasStoredInvite;
    const canRegister = hasStoredInvite || !!parsedInviteSenderId;
    const referralHintText = canRegister
      ? 'Регистрация по приглашению'
      : 'Введите ссылку для регистрации';
    const inviteLinkError =
      !hasStoredInvite && inviteLink.trim() && !parsedInviteSenderId
        ? 'Введите валидную пригласительную ссылку'
        : undefined;

    useEffect(() => {
      const senderId = authStore.syncRegistrationSenderId();
      if (!senderId) {
        return;
      }

      const storedInviteLink =
        getStoredReferralInviteLink() ?? buildTelegramStartAppLink(senderId);

      setInviteLink((previous) => previous || storedInviteLink);
    }, [authStore]);

    const {
      values,
      errors,
      isSubmitting,
      handleChange,
      handleInputChange,
      handleSubmit,
    } = useFormWithValidation({
      initialValues: {
        phone: authStore.tempData.phone ?? '',
        login: authStore.tempData.login ?? '',
        password: authStore.tempData.password ?? '',
        confirmPassword: authStore.tempData.password ?? '',
        agreeToTerms: false as unknown as true,
      },
      schema: registerSchema,
      onSubmit: async (values) => {
        if (parsedInviteSenderId) {
          authStore.setRegistrationSenderId(parsedInviteSenderId);
        }

        if (!authStore.hasRegistrationSenderId) {
          return;
        }

        const success = await authStore.preRegisterAndSendCodeAction({
          initData: WebApp.initData || '',
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
      const requestContactCallback: Parameters<
        typeof WebApp.requestContact
      >[0] = (success, response) => {
        const phoneNumberFromTelegram =
          response?.status === 'sent'
            ? response.responseUnsafe.contact.phone_number
            : undefined;

        if (success && phoneNumberFromTelegram) {
          const normalizedPhone = phoneNumberFromTelegram.startsWith('+')
            ? phoneNumberFromTelegram
            : `+${phoneNumberFromTelegram}`;
          handleChange('phone', normalizedPhone);
        } else {
          console.log('Phone request failed or cancelled');
        }
      };

      WebApp.requestContact(requestContactCallback);
    };

    return (
      <Page className={s.registerForm} smallPaddingBottom>
        <div className={s.content}>
          <h1 className={s.title}>Регистрация</h1>
          <div className={s.referralHint}>{referralHintText}</div>

          {!isInviteLocked && (
            <div className={s.inputGroup}>
              <span className={s.label}>Пригласительная ссылка</span>
              <TextInput
                classNames={{
                  input: `${s.input} ${inviteLinkError ? s.error : ''}`,
                }}
                value={inviteLink}
                onChange={(event) => setInviteLink(event.currentTarget.value)}
                placeholder="https://t.me/Tarelka_dev_weak_bot?startapp=..."
                error={inviteLinkError}
                radius="xl"
                size="lg"
              />
            </div>
          )}

          {isInviteLocked && (
            <div className={s.inputGroup}>
              <span className={s.label}>Пригласительная ссылка</span>
              <span className={s.hint}>Ссылка добавлена автоматически</span>
            </div>
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
                  <span
                    className={s.termsLink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTermsOpened(true);
                    }}
                  >
                    Правилами использования
                  </span>
                </>
              }
              size="sm"
            />
          </div>
        </div>

        <TermsDrawer
          opened={termsOpened}
          onClose={() => setTermsOpened(false)}
        />

        <div className={s.footer}>
          <p className={s.loginLink}>
            Есть аккаунт? <span onClick={onNavigateToLogin}>Войти</span>
          </p>
          <Button
            className={s.submitButton}
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!canRegister}
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
