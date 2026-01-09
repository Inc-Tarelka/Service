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
