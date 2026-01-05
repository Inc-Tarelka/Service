import { lazy } from 'react';

export const ConfirmCodeForm = lazy(() =>
  import('./ui/ConfirmCodeForm/ConfirmCodeForm').then((module) => ({
    default: module.ConfirmCodeForm,
  })),
);
export const LoginForm = lazy(() =>
  import('./ui/LoginForm/LoginForm').then((module) => ({
    default: module.LoginForm,
  })),
);
export const NewPasswordForm = lazy(() =>
  import('./ui/NewPasswordForm/NewPasswordForm').then((module) => ({
    default: module.NewPasswordForm,
  })),
);
export const PasswordResetForm = lazy(() =>
  import('./ui/PasswordResetForm/PasswordResetForm').then((module) => ({
    default: module.PasswordResetForm,
  })),
);
export const ProfileForm = lazy(() =>
  import('./ui/ProfileForm/ProfileForm').then((module) => ({
    default: module.ProfileForm,
  })),
);
export const RegisterForm = lazy(() =>
  import('./ui/RegisterForm/RegisterForm').then((module) => ({
    default: module.RegisterForm,
  })),
);

export { authStore } from './model/AuthStore';
export {
  CITIES,
  DEFAULT_STEP,
  SPECIALIZATIONS,
  VALID_STEPS,
} from './model/types';
export type {
  AccountType,
  AuthStep,
  ConfirmCodeType,
  LoginFormData,
  NewPasswordFormData,
  ProfileFormData,
  RegisterFormData,
  ResetFormData,
  TempAuthData,
} from './model/types';

export {
  confirmCodeSchema,
  loginSchema,
  newPasswordSchema,
  profileSchema,
  registerSchema,
  resetSchema,
} from './model/validation';

export {
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  setNewPasswordRequest,
  verifyCodeRequest,
} from './api/authApi';
