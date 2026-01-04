import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
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
import { useBackButton } from 'shared/hooks/useBackButton';

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

  const goToStep = (nextStep: AuthStep, options?: { replace?: boolean }) => {
    setSearchParams({ step: nextStep }, { replace: options?.replace ?? false });
  };

  useBackButton({
    onBack: () => {
      if (step === 'login' || step === 'register') {
        authStore.clearTempData();
        navigate(RoutePath.main);
      } else {
        navigate(-1);
      }
    },
  });

  useEffect(() => {
    if (step === 'confirmLogin' && !authStore.hasVerificationToken) {
      goToStep('login', { replace: true });
      return;
    }

    if (step === 'registerProfile' && !authStore.hasLogin) {
      goToStep('register', { replace: true });
      return;
    }

    if (step === 'confirmReset' && !authStore.hasLogin) {
      goToStep('reset', { replace: true });
      return;
    }

    if (step === 'newPassword' && !authStore.hasResetToken) {
      goToStep('reset', { replace: true });
      return;
    }
  }, [step]);
  const renderStep = () => {
    switch (step) {
      case 'login':
        return (
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
        );
      case 'confirmLogin':
        return (
          <ConfirmCodeForm
            type="login"
            onSuccess={() => {
              authStore.clearTempData();
              navigate(RoutePath.main);
            }}
            onResend={() => {
              goToStep('login', { replace: true });
            }}
          />
        );
      case 'register':
        return (
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
        );
      case 'registerProfile':
        return (
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
              navigate(RoutePath.main);
            }}
          />
        );
      case 'reset':
        return (
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
        );
      case 'confirmReset':
        return (
          <ConfirmCodeForm
            type="reset"
            onSuccess={(verifiedToken) => {
              authStore.setTempData({ resetToken: verifiedToken });
              goToStep('newPassword');
            }}
            onResend={() => {
              goToStep('reset', { replace: true });
            }}
          />
        );
      case 'newPassword':
        return (
          <NewPasswordForm
            onSuccess={(token) => {
              authStore.clearTempData();
              if (token) {
                setToken(token);
              } else {
                goToStep('login', { replace: true });
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return renderStep();
});

export default AuthPage;
