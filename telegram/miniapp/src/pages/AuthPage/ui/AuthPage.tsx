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
} from 'features/auth';
import { useStore } from 'app/StoreProvider';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';
import { useBackButton } from 'shared/hooks/useBackButton';
import classNames from 'shared/library/ClassNames/classNames';
import { verificationStore } from 'shared/store/api/Verification/verification-store';

export const AuthPage = observer(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { authStore } = useStore();

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
    console.log('Current step:', step);
    console.log('authStore.tempData:', authStore.tempData);
  }, [step, authStore.tempData]);

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
            authStore.clearTempData();
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
            authStore.setTempData({
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
            if (authStore.tempData.phone) {
              const success = await verificationStore.sendCode(
                authStore.tempData.phone,
              );
              if (success && verificationStore.requestId) {
                authStore.setTempData({
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
            authStore.clearTempData();
            navigate(RoutePath.main, { replace: true });
          }}
        />
      </Activity>

      <Activity mode={step === 'reset' ? 'visible' : 'hidden'}>
        <PasswordResetForm
          onSuccess={(data) => {
            console.log('PasswordResetForm onSuccess:', data);
            authStore.setTempData({
              login: data.login,
              verificationRequestId: data.requestId,
            });
            console.log('After setTempData:', authStore.tempData);
            goToStep('confirmReset');
          }}
        />
      </Activity>

      <Activity mode={step === 'confirmReset' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="reset"
          onSuccess={(code) => {
            console.log('ConfirmCodeForm onSuccess with code:', code);
            console.log('Current tempData:', authStore.tempData);
            goToStep('newPassword');
          }}
          onResend={async () => {
            if (authStore.tempData.login) {
              const requestId = await authStore.forgotPasswordAction({
                username: authStore.tempData.login,
              });

              if (requestId) {
                authStore.setTempData({
                  verificationRequestId: requestId,
                });
              } else {
                console.error('Failed to resend password reset code');
                goToStep('reset', { replace: true });
              }
            } else {
              console.error('No login found in tempData');
              goToStep('reset', { replace: true });
            }
          }}
        />
      </Activity>

      <Activity mode={step === 'newPassword' ? 'visible' : 'hidden'}>
        <NewPasswordForm
          onSuccess={(token) => {
            console.log('NewPasswordForm onSuccess called with token:', token);
            console.log('authStore.isAuth:', authStore.isAuth);
            console.log('authStore.token:', authStore.token);

            authStore.clearTempData();

            if (token) {
              setToken(token);
              setTimeout(() => {
                navigate(RoutePath.main, { replace: true });
              }, 100);
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
