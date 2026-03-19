import { AccountType as ApiAccountType } from 'shared/api/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SendPhoneVerificationRequest {
  PhoneNumber: string;
}

export interface SendPhoneVerificationResponse {
  requestId: string;
}

export interface VerifyCodeRequest {
  verificationCode: string;
  verificationRequestId: string;
}

export interface VerifyCodeResponse {
  status: string;
  phone?: string;
}

export interface AccountData {
  type: ApiAccountType;
  username: string;
  password: string;
  phone: string;
  name?: string;
  surname?: string;
  companyName?: string;
}

export interface PhoneVerification {
  verificationCode: string;
  verificationRequestId: string;
}

export interface TelegramRegisterRequest {
  initData: string;
  account: {
    type: ApiAccountType;
    username: string;
    phone: string;
    password: string;
  };
  phoneVerification: PhoneVerification;
  specializationIds: number[];
  directionIds: number[];
  cityIds: number[];
}

export interface PreRegisterRequest {
  initData: string;
  account: {
    type: ApiAccountType;
    username: string;
    phone: string;
    password?: string;
    name?: string;
    surname?: string;
    companyName?: string;
  };
}

export interface PreRegisterResponse {
  userId: number;
}

export interface RegisterRequest {
  account: {
    username: string;
    phone: string;
  };
  cityIds: number[];
  directionIds: number[];
  initData: string;
  phoneVerification: PhoneVerification;
  specializationIds: number[];
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface ForgotPasswordRequest {
  username: string;
}

export interface ForgotPasswordResponse {
  requestId: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  username: string;
  verificationCode: string;
  verificationRequestId: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}
