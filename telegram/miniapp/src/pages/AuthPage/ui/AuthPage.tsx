import { observer } from 'mobx-react-lite';
import { Activity, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import s from './AuthPage.module.scss';

import type { AuthStep } from 'features/auth';
import {
  ConfirmCodeForm,
  DEFAULT_STEP,
  LoginForm,
  NewPasswordForm,
  PasswordResetForm,
  ProfileForm,
  RegisterForm,
  VALID_STEPS,
  authStore as wizardStore,
} from 'features/auth';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';
import { useBackButton } from 'shared/hooks/useBackButton';
import classNames from 'shared/library/ClassNames/classNames';
import { verificationStore } from 'shared/store/api/Verification/verification-store';

const STEP_GUARDS: Partial<
  Record<AuthStep, { check: () => boolean; fallback: AuthStep }>
> = {
  confirmLogin: {
    check: () => wizardStore.hasVerificationToken,
    fallback: 'login',
  },
  registerConfirm: {
    check: () => !!wizardStore.tempData.verificationRequestId,
    fallback: 'register',
  },
  registerProfile: {
    check: () => !!wizardStore.tempData.verificationCode,
    fallback: 'register',
  },
  confirmReset: {
    check: () => wizardStore.hasLogin,
    fallback: 'reset',
  },
  newPassword: {
    check: () => wizardStore.hasResetToken,
    fallback: 'reset',
  },
};

/**
 * Главная страница авторизации с step-based навигацией
 *
 * Flow:
 * - Вход: login → confirmLogin → main
 * - Регистрация: register → registerProfile → main
 * - Восстановление: reset → confirmReset → newPassword → login
 */
export const AuthPage = observer(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const rawStep = searchParams.get('step');
  const step: AuthStep = VALID_STEPS.includes(rawStep as AuthStep)
    ? (rawStep as AuthStep)
    : DEFAULT_STEP;

  const showBackButton = step !== DEFAULT_STEP;

  useBackButton({
    show: showBackButton,
    fallbackPath: RoutePath.auth,
  });

  const goToStep = useCallback(
    (nextStep: AuthStep, options?: { replace?: boolean }) => {
      setSearchParams(
        { step: nextStep },
        { replace: options?.replace ?? false },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const guard = STEP_GUARDS[step];
    if (!guard) return;

    if (!guard.check()) {
      goToStep(guard.fallback, { replace: true });
    }
  }, [step, goToStep]);

  return (
    <div className={classNames(s.authPage, {}, [])}>
      <Activity mode={step === 'login' ? 'visible' : 'hidden'}>
        <LoginForm
          onSuccess={() => {
            navigate(RoutePath.main, { replace: true });
          }}
          onNavigateToRegister={() => goToStep('register')}
          onNavigateToReset={() => goToStep('reset')}
        />
      </Activity>

      <Activity mode={step === 'confirmLogin' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="login"
          onSuccess={(token) => {
            wizardStore.clearTempData();
            if (token) {
              setToken(token);
              navigate(RoutePath.main, { replace: true });
            } else {
              goToStep('login', { replace: true });
            }
          }}
          onResend={() => goToStep('login', { replace: true })}
        />
      </Activity>

      <Activity mode={step === 'register' ? 'visible' : 'hidden'}>
        <RegisterForm
          onSuccess={(data) => {
            wizardStore.setTempData({
              phone: data.phone,
              login: data.login,
              password: data.password,
              verificationRequestId: data.verificationRequestId,
            });
            goToStep('registerConfirm');
          }}
          onNavigateToLogin={() => goToStep('login')}
        />
      </Activity>

      <Activity mode={step === 'registerConfirm' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="register"
          onSuccess={() => {
            goToStep('registerProfile');
          }}
          onResend={async () => {
            if (wizardStore.tempData.phone) {
              const success = await verificationStore.sendCode(
                wizardStore.tempData.phone,
              );
              if (success && verificationStore.requestId) {
                wizardStore.setTempData({
                  verificationRequestId: verificationStore.requestId,
                });
              }
            } else {
              goToStep('register', { replace: true });
            }
          }}
        />
      </Activity>

      <Activity mode={step === 'registerProfile' ? 'visible' : 'hidden'}>
        <ProfileForm
          onSuccess={() => {
            wizardStore.clearTempData();
            navigate(RoutePath.main, { replace: true });
          }}
        />
      </Activity>

      <Activity mode={step === 'reset' ? 'visible' : 'hidden'}>
        <PasswordResetForm
          onSuccess={(data) => {
            wizardStore.setTempData({
              login: data.login,
              phone: data.phone,
              resetToken: data.token,
            });
            goToStep('confirmReset');
          }}
        />
      </Activity>

      <Activity mode={step === 'confirmReset' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="reset"
          onSuccess={(verifiedToken) => {
            wizardStore.setTempData({ resetToken: verifiedToken });
            goToStep('newPassword');
          }}
          onResend={() => goToStep('reset', { replace: true })}
        />
      </Activity>

      <Activity mode={step === 'newPassword' ? 'visible' : 'hidden'}>
        <NewPasswordForm
          onSuccess={(token) => {
            wizardStore.clearTempData();
            if (token) {
              setToken(token);
              navigate(RoutePath.main, { replace: true });
            } else {
              goToStep('login', { replace: true });
            }
          }}
        />
      </Activity>
    </div>
  );
});

export default AuthPage;
