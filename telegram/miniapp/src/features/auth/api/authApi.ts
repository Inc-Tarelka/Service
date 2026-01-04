export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  message?: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  success: boolean;
  token: string;
  message?: string;
}

export interface VerifyCodeRequest {
  phone: string;
  code: string;
  token: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  accessToken?: string;
  message?: string;
}

export interface ResetPasswordRequest {
  phone: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  token: string;
  message?: string;
}

export interface SetNewPasswordRequest {
  token: string;
  password: string;
}

export interface SetNewPasswordResponse {
  success: boolean;
  message?: string;
  token?: string;
}

/**
 * Запрос на вход (заглушка)
 */
export const loginRequest = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  console.log('Login request:', data);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    token: 'mock-verification-token-' + Date.now(),
  };
};

/**
 * Запрос на регистрацию (заглушка)
 */
export const registerRequest = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  console.log('Register request:', data);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    token: 'mock-register-token-' + Date.now(),
  };
};

/**
 * Подтверждение кода (заглушка)
 */
export const verifyCodeRequest = async (
  data: VerifyCodeRequest,
): Promise<VerifyCodeResponse> => {
  console.log('Verify code request:', data);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    accessToken: 'mock-access-token-' + Date.now(),
  };
};

/**
 * Запрос на сброс пароля (заглушка)
 */
export const resetPasswordRequest = async (
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  console.log('Reset password request:', data);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    token: 'mock-reset-token-' + Date.now(),
  };
};

/**
 * Установка нового пароля (заглушка)
 */
export const setNewPasswordRequest = async (
  data: SetNewPasswordRequest,
): Promise<SetNewPasswordResponse> => {
  console.log('Set new password request:', data);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: 'Пароль успешно изменён',
    token: 'mock-access-token-' + Date.now(),
  };
};
