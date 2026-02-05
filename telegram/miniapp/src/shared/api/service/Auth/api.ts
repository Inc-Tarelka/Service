import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1, publicInstance } from 'shared/api/base';

import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './types';

// =============================== LOGIN ===============================
export const loginRequest = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await publicInstance.post<LoginResponse>(
    API_URL.login(),
    data,
  );
  return response.data;
};

// =============================== LOGOUT ===============================
export const logoutRequest = async (data: LogoutRequest): Promise<void> => {
  await baseInstanceV1.post(API_URL.logout(), data);
};

// =============================== REGISTER ===============================
export const registerRequest = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const response = await publicInstance.post<RegisterResponse>(
    API_URL.telegram_register(),
    data,
  );
  return response.data;
};

// =============================== PHONE VERIFICATION ===============================
export const sendPhoneVerificationRequest = async (
  data: SendPhoneVerificationRequest,
): Promise<SendPhoneVerificationResponse> => {
  const response = await publicInstance.post<SendPhoneVerificationResponse>(
    API_URL.send_phone(),
    data,
  );
  return response.data;
};

export const verifyCodeRequest = async (
  data: VerifyCodeRequest,
): Promise<VerifyCodeResponse> => {
  const response = await publicInstance.post<VerifyCodeResponse>(
    API_URL.verify_code(),
    data,
  );
  return response.data;
};

// =============================== TOKEN REFRESH ===============================
export const refreshRequest = async (
  data: RefreshRequest,
): Promise<RefreshResponse> => {
  const response = await publicInstance.post<RefreshResponse>(
    API_URL.refresh(),
    data,
  );
  return response.data;
};

// =============================== FORGOT PASSWORD ===============================
export const forgotPasswordRequest = async (
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
  const response = await publicInstance.post<ForgotPasswordResponse>(
    API_URL.forgot_password(),
    data,
  );
  return response.data;
};

// =============================== RESET PASSWORD ===============================
export const resetPasswordRequest = async (
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const response = await publicInstance.post<ResetPasswordResponse>(
    API_URL.reset_password(),
    data,
  );
  return response.data;
};
