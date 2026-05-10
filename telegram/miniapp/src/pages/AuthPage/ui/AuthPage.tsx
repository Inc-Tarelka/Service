import { observer } from 'mobx-react-lite';
import { Activity, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import s from './AuthPage.module.scss';

import { useStore } from 'app/StoreProvider';
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
import { useAuth } from 'shared/hooks/useAuth';
import { useBackButton } from 'shared/hooks/useBackButton';
import classNames from 'shared/library/ClassNames/classNames';
import { verificationStore } from 'shared/store/api/Verification/verification-store';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

export const AuthPage = observer(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { authStore } = useStore();
  const initialRedirectPendingRef = useRef(
    !!authStore.currentStep && !searchParams.get('step'),
  );
  const autoResendDoneRef = useRef(false);

  useEffect(() => {
    authStore.syncRegistrationSenderId();
  }, [authStore]);

  const rawStep = searchParams.get('step');
  const isReferral = authStore.hasRegistrationSenderId;
  const step: AuthStep = VALID_STEPS.includes(rawStep as AuthStep)
    ? (rawStep as AuthStep)
    : isReferral
      ? 'register'
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

  const needsConfirmRedirect =
    step === 'registerProfile' &&
    !authStore.tempData.verificationCode &&
    !!authStore.tempData.phone;

  useEffect(() => {
    if (needsConfirmRedirect) {
      setSearchParams({ step: 'registerConfirm' }, { replace: true });
      return;
    }
    if (initialRedirectPendingRef.current) {
      initialRedirectPendingRef.current = false;
      const restored = authStore.currentStep;
      if (restored) {
        setSearchParams({ step: restored }, { replace: true });
        return;
      }
    }
    authStore.setCurrentStep(step);
  }, [step, authStore, setSearchParams, needsConfirmRedirect]);

  useEffect(() => {
    if (step !== 'registerConfirm') {
      autoResendDoneRef.current = false;
      return;
    }
    if (autoResendDoneRef.current) return;
    if (verificationStore.requestId) return;
    if (authStore.tempData.verificationRequestId) {
      verificationStore.requestId = authStore.tempData.verificationRequestId;
      autoResendDoneRef.current = true;
      return;
    }

    const phone = authStore.tempData.phone;
    if (!phone) return;

    autoResendDoneRef.current = true;
    void verificationStore.sendCode(phone).then((ok) => {
      if (ok && verificationStore.requestId) {
        authStore.setTempData({
          verificationRequestId: verificationStore.requestId,
        });
      }
    });
  }, [step, authStore]);

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
            authStore.setTempData({
              login: data.login,
              verificationRequestId: data.requestId,
            });
            goToStep('confirmReset');
          }}
        />
      </Activity>

      <Activity mode={step === 'confirmReset' ? 'visible' : 'hidden'}>
        <ConfirmCodeForm
          type="reset"
          onSuccess={() => {
            goToStep('newPassword');
          }}
          onResend={async () => {
            if (authStore.tempData.login) {
              const requestId = await authStore.forgotPasswordAction({
                username: authStore.tempData.login,
              });
              if (requestId) {
                authStore.setTempData({ verificationRequestId: requestId });
              } else {
                goToStep('reset', { replace: true });
              }
            } else {
              goToStep('reset', { replace: true });
            }
          }}
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
    </div>
  );
});

export default AuthPage;
