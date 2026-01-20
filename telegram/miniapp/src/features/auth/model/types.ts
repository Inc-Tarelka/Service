export type {
  AccountData,
  LoginRequest,
  LoginResponse,
  PhoneVerification,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from 'shared/api/service/Auth/types';

export type AuthStep =
  | 'login' // Вход: логин + пароль
  | 'confirmLogin' // Подтверждение входа (код в Telegram)
  | 'register' // Регистрация: тип + логин + пароль + правила
  | 'registerConfirm' // Подтверждение телефона регистрации
  | 'registerProfile' // Расскажите о себе
  | 'reset' // Восстановление пароля: ввод логина
  | 'confirmReset' // Подтверждение телефона
  | 'newPassword'; // Новый пароль

export const DEFAULT_STEP: AuthStep = 'login';

export const VALID_STEPS: AuthStep[] = [
  'login',
  'confirmLogin',
  'register',
  'registerConfirm',
  'registerProfile',
  'reset',
  'confirmReset',
  'newPassword',
];

export type AccountType = 'specialist' | 'company';

export interface TempAuthData {
  login?: string;
  phone?: string;
  verificationToken?: string;
  verificationRequestId?: string;
  verificationCode?: string;

  accountType?: AccountType;
  password?: string;

  resetToken?: string;

  name?: string;
  lastName?: string;
  nickname?: string;
  specialization?: string;
  city?: string;
}

export interface LoginFormData {
  login: string;
  password: string;
}

export interface RegisterFormData {
  phone: string;
  login: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ProfileFormData {
  accountType: AccountType;
  name: string;
  lastName: string;
  specialization: string;
  city: string;
}

export interface ResetFormData {
  login: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export type ConfirmCodeType = 'login' | 'reset' | 'register';
