import { Button, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useStore } from 'app/StoreProvider';
import { useFormWithValidation } from 'shared/hooks/useFormWithValidation';
import { verificationStore } from 'shared/store/api/Verification/verification-store';
import { Page } from 'widgets/Page';
import { ConfirmCodeType } from '../../model/types';
import { confirmCodeSchema } from '../../model/validation';

import s from './ConfirmCodeForm.module.scss';

interface ConfirmCodeFormProps {
  type?: ConfirmCodeType;
  onSuccess: (verifiedToken?: string) => void;
  onResend: () => void;
}

const RESEND_TIMEOUT = 59;
const CODE_LENGTH = 4;

export const ConfirmCodeForm = observer(
  ({ type = 'login', onSuccess, onResend }: ConfirmCodeFormProps) => {
    const { authStore } = useStore();

    const {
      values,
      errors,
      isSubmitting,
      handleChange,
      handleSubmit,
      setErrors,
      setValues,
    } = useFormWithValidation({
      initialValues: { code: '' },
      schema: confirmCodeSchema,
      onSubmit: async (values) => {
        try {
          const requestId =
            verificationStore.requestId ||
            authStore.tempData.verificationRequestId ||
            authStore.tempData.verificationToken ||
            authStore.tempData.resetToken;

          if (!requestId) {
            setErrors({ code: 'Ошибка: ID запроса не найден' });
            return;
          }

          let success = false;
          if (verificationStore.requestId) {
            success = await verificationStore.verifyCode(values.code);
          } else {
            verificationStore.requestId = requestId;
            success = await verificationStore.verifyCode(values.code);
          }

          if (success) {
            if (type === 'register' || type === 'reset') {
              authStore.setTempData({ verificationCode: values.code });
            }
            onSuccess(values.code);
          } else {
            setErrors({
              code: verificationStore.error || 'Неверный код',
            });
          }
        } catch (err) {
          console.error('Verify error:', err);
          setErrors({ code: 'Ошибка проверки кода' });
        }
      },
    });

    const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const code = [
      ...values.code.split(''),
      ...Array(CODE_LENGTH).fill(''),
    ].slice(0, CODE_LENGTH);

    useEffect(() => {
      if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendTimer]);

    useEffect(() => {
      inputRefs.current[0]?.focus();
    }, []);

    const handleCodeChange = useCallback(
      (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);

        const newCode = [...code];
        newCode[index] = digit;
        const newCodeString = newCode.join('');

        handleChange('code', newCodeString);

        if (digit && index < CODE_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      },
      [code, handleChange],
    );

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      },
      [code],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData
          .getData('text')
          .replace(/\D/g, '')
          .slice(0, CODE_LENGTH);

        if (pastedData) {
          handleChange('code', pastedData);
          const lastFilledIndex = Math.min(pastedData.length, CODE_LENGTH) - 1;
          inputRefs.current[lastFilledIndex]?.focus();
        }
      },
      [handleChange],
    );

    const getTitle = () => {
      switch (type) {
        case 'login':
          return 'Подтверждение входа';
        case 'register':
          return 'Подтверждение регистрации';
        case 'reset':
          return 'Восстановление пароля';
        default:
          return 'Подтверждение телефона';
      }
    };

    const getSubtitle = () => {
      const phone = authStore.maskedPhone;
      return (
        <>
          Мы отправили сообщение с кодом
          <br />в Телеграм на номер <span className={s.phone}>{phone}</span>
        </>
      );
    };

    const handleResend = () => {
      setResendTimer(RESEND_TIMEOUT);
      setValues({ code: '' });
      setErrors({});
      inputRefs.current[0]?.focus();
      onResend();
    };

    const isCodeComplete = values.code.length === CODE_LENGTH;

    return (
      <Page className={s.confirmCodeForm} smallPaddingBottom>
        <div className={s.content}>
          <div className={s.titleGroup}>
            <h1 className={s.title}>{getTitle()}</h1>
            <Text className={s.subtitle}>{getSubtitle()}</Text>
          </div>

          <div className={s.codeInputWrapper} onPaste={handlePaste}>
            {Array(CODE_LENGTH)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  className={`${s.codeInput} ${errors.code ? s.error : ''}`}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  autoComplete="one-time-code"
                />
              ))}
          </div>
        </div>

        <div className={s.footer}>
          <div className={s.resendWrapper}>
            <p className={s.resendText}>Не пришел код?</p>
            {resendTimer > 0 ? (
              <span className={`${s.resendLink} ${s.disabled}`}>
                Отправить снова через 0:
                {resendTimer.toString().padStart(2, '0')}
              </span>
            ) : (
              <span className={s.resendLink} onClick={handleResend}>
                Отправить снова
              </span>
            )}
          </div>
          <Button
            className={s.submitButton}
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isCodeComplete}
            fullWidth
            radius="xl"
            size="lg"
            variant="filled"
          >
            Подтвердить
          </Button>
        </div>
      </Page>
    );
  },
);
