// UI Components
export { ConfirmCodeForm } from './ui/ConfirmCodeForm/ConfirmCodeForm';
export { LoginForm } from './ui/LoginForm/LoginForm';
export { NewPasswordForm } from './ui/NewPasswordForm/NewPasswordForm';
export { PasswordResetForm } from './ui/PasswordResetForm/PasswordResetForm';
export { ProfileForm } from './ui/ProfileForm/ProfileForm';
export { RegisterForm } from './ui/RegisterForm/RegisterForm';

// Model
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

// Validation (zod schemas)
export {
  confirmCodeSchema,
  loginSchema,
  newPasswordSchema,
  profileSchema,
  registerSchema,
  resetSchema,
  validateForm,
} from './model/validation';

// API
export {
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  setNewPasswordRequest,
  verifyCodeRequest,
} from './api/authApi';
