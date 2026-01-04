/**
 * Шаги авторизации
 */
export type AuthStep =
  | 'login' // Вход: логин + пароль
  | 'confirmLogin' // Подтверждение входа (код в Telegram)
  | 'register' // Регистрация: тип + логин + пароль + правила
  | 'registerProfile' // Расскажите о себе
  | 'reset' // Восстановление пароля: ввод логина
  | 'confirmReset' // Подтверждение телефона
  | 'newPassword'; // Новый пароль

export const DEFAULT_STEP: AuthStep = 'login';

export const VALID_STEPS: AuthStep[] = [
  'login',
  'confirmLogin',
  'register',
  'registerProfile',
  'reset',
  'confirmReset',
  'newPassword',
];

export type AccountType = 'specialist' | 'company';

export interface TempAuthData {
  // Login/Register
  login?: string;
  phone?: string;
  verificationToken?: string;

  // Register specific
  accountType?: AccountType;
  password?: string;

  // Reset password
  resetToken?: string;

  // Profile data (registerProfile step)
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
  accountType: AccountType;
  login: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ProfileFormData {
  name: string;
  lastName: string;
  nickname: string;
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

export type ConfirmCodeType = 'login' | 'reset';

export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
];

export const SPECIALIZATIONS = [
  'Вариант по умолчанию',
  'Разработка',
  'Дизайн',
  'Маркетинг',
  'Продажи',
  'Аналитика',
  'Управление',
  'Финансы',
  'HR',
  'Другое',
];
