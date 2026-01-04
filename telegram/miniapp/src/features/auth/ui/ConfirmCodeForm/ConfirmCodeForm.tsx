import { Button, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Page } from 'widgets/Page';
import { verifyCodeRequest } from '../../api/authApi';
import { authStore } from '../../model/AuthStore';
import { ConfirmCodeType } from '../../model/types';

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
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendTimer]);

    useEffect(() => {
      inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = useCallback((index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);

      setCode((prev) => {
        const newCode = [...prev];
        newCode[index] = digit;
        return newCode;
      });

      setError(null);

      if (digit && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }, []);

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
          const newCode = [...code];
          pastedData.split('').forEach((digit, i) => {
            if (i < CODE_LENGTH) newCode[i] = digit;
          });
          setCode(newCode);

          const lastFilledIndex = Math.min(pastedData.length, CODE_LENGTH) - 1;
          inputRefs.current[lastFilledIndex]?.focus();
        }
      },
      [code],
    );

    const getTitle = () => {
      return type === 'login'
        ? 'Подтверждение входа'
        : 'Подтверждение телефона';
    };

    const getSubtitle = () => {
      const phone = authStore.maskedPhone || '+7 (999) 123-45-67';
      return (
        <>
          Мы отправили сообщение с кодом
          <br />в Телеграм на номер <span className={s.phone}>{phone}</span>
        </>
      );
    };

    const handleSubmit = async () => {
      const fullCode = code.join('');

      if (fullCode.length !== CODE_LENGTH) {
        setError('Введите 4-значный код');
        return;
      }

      setIsLoading(true);

      try {
        const response = await verifyCodeRequest({
          phone: authStore.tempData.phone || '',
          code: fullCode,
          token:
            authStore.tempData.verificationToken ||
            authStore.tempData.resetToken ||
            '',
        });

        if (response.success) {
          onSuccess(response.accessToken);
        } else {
          setError(response.message || 'Неверный код');
        }
      } catch (err) {
        console.error('Verify error:', err);
        setError('Ошибка проверки кода');
      } finally {
        setIsLoading(false);
      }
    };

    const handleResend = () => {
      setResendTimer(RESEND_TIMEOUT);
      setCode(Array(CODE_LENGTH).fill(''));
      setError(null);
      inputRefs.current[0]?.focus();
      onResend();
    };

    const isCodeComplete = code.every((digit) => digit !== '');

    return (
      <Page className={s.confirmCodeForm}>
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
                  className={s.codeInput}
                  value={code[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  autoComplete="one-time-code"
                />
              ))}
          </div>

          {error && <p className={s.error}>{error}</p>}
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
            loading={isLoading}
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
