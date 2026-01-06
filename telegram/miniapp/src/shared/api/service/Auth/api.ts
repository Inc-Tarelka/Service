import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SetNewPasswordRequest,
  SetNewPasswordResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from './types';

// =============================== LOGIN ===============================
export const loginRequest = async (
  _data: LoginRequest,
): Promise<LoginResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    token: 'mock-verification-token-' + Date.now(),
  };
  // Real implementation would be:
  // const response = await publicInstance.post<LoginResponse>(API_URL.login(), data);
  // return response.data;
};

// =============================== REGISTER ===============================
export const registerRequest = async (
  _data: RegisterRequest,
): Promise<RegisterResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    token: 'mock-register-token-' + Date.now(),
  };
  // const response = await publicInstance.post<RegisterResponse>(API_URL.register(), data);
  // return response.data;
};

// =============================== VERIFY CODE ===============================
export const verifyCodeRequest = async (
  _data: VerifyCodeRequest,
): Promise<VerifyCodeResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    accessToken: 'mock-access-token-' + Date.now(),
  };
  // const response = await publicInstance.post<VerifyCodeResponse>(API_URL.verify_code(), data);
  // return response.data;
};

// =============================== RESET PASSWORD ===============================
export const resetPasswordRequest = async (
  _data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    token: 'mock-reset-token-' + Date.now(),
  };
  // const response = await publicInstance.post<ResetPasswordResponse>(API_URL.reset_password(), data);
  // return response.data;
};

// =============================== SET NEW PASSWORD ===============================
export const setNewPasswordRequest = async (
  _data: SetNewPasswordRequest,
): Promise<SetNewPasswordResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    message: 'Пароль успешно изменён',
    token: 'mock-access-token-' + Date.now(),
  };
  // const response = await publicInstance.post<SetNewPasswordResponse>(API_URL.set_new_password(), data);
  // return response.data;
};
