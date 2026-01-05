import { Activity } from 'react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { AuthStep } from 'features/auth';
import {
  authStore,
  ConfirmCodeForm,
  DEFAULT_STEP,
  LoginForm,
  NewPasswordForm,
  PasswordResetForm,
  ProfileForm,
  RegisterForm,
  VALID_STEPS,
} from 'features/auth';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';

const STEP_GUARDS: Partial<
  Record<AuthStep, { check: () => boolean; fallback: AuthStep }>
> = {
  confirmLogin: {
    check: () => authStore.hasVerificationToken,
    fallback: 'login',
  },
  registerProfile: {
    check: () => authStore.hasLogin,
    fallback: 'register',
  },
  confirmReset: {
    check: () => authStore.hasLogin,
    fallback: 'reset',
  },
  newPassword: {
    check: () => authStore.hasResetToken,
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
    <>
      <Activity mode={step === 'login' ? 'visible' : 'hidden'}>
        <LoginForm
          onSuccess={(data) => {
            authStore.setTempData({
              login: data.login,
              phone: data.phone,
              verificationToken: data.token,
            });
            goToStep('confirmLogin');
          }}
          onNavigateToRegister={() => goToStep('register')}
          onNavigateToReset={() => goToStep('reset')}
        />
      </Activity>

      <Activity mode={step === 'confirmLogin' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="login"
          onSuccess={() => {
            authStore.clearTempData();
            navigate(RoutePath.main, { replace: true });
          }}
          onResend={() => goToStep('login', { replace: true })}
        />
      </Activity>

      <Activity mode={step === 'register' ? 'visible' : 'hidden'}>
        <RegisterForm
          onSuccess={(data) => {
            authStore.setTempData({
              accountType: data.accountType,
              login: data.login,
              password: data.password,
            });
            goToStep('registerProfile');
          }}
          onNavigateToLogin={() => goToStep('login')}
        />
      </Activity>

      <Activity mode={step === 'registerProfile' ? 'visible' : 'hidden'}>
        <ProfileForm
          onSuccess={(profileData) => {
            authStore.setTempData({
              name: profileData.name,
              lastName: profileData.lastName,
              nickname: profileData.nickname,
              specialization: profileData.specialization,
              city: profileData.city,
            });
            authStore.clearTempData();
            navigate(RoutePath.main, { replace: true });
          }}
        />
      </Activity>

      <Activity mode={step === 'reset' ? 'visible' : 'hidden'}>
        <PasswordResetForm
          onSuccess={(data) => {
            authStore.setTempData({
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
            authStore.setTempData({ resetToken: verifiedToken });
            goToStep('newPassword');
          }}
          onResend={() => goToStep('reset', { replace: true })}
        />
      </Activity>

      <Activity mode={step === 'newPassword' ? 'visible' : 'hidden'}>
        <NewPasswordForm
          onSuccess={(token) => {
            authStore.clearTempData();
            if (token) {
              setToken(token);
              navigate(RoutePath.main, { replace: true });
            } else {
              goToStep('login', { replace: true });
            }
          }}
        />
      </Activity>
    </>
  );
});

export default AuthPage;
