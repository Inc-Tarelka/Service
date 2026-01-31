import { makeAutoObservable, runInAction } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  clearAccessToken,
  getAccessToken,
  loadAccessTokenOnce,
  setAccessToken,
  setRefreshToken,
} from 'shared/api/base';
import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  resetPasswordRequest,
  sendPhoneVerificationRequest,
  verifyCodeRequest,
} from 'shared/api/service/Auth/api';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from 'shared/api/service/Auth/types';

export class AuthStore {
  loginData?: IPromiseBasedObservable<LoginResponse>;
  registerData?: IPromiseBasedObservable<RegisterResponse>;
  phoneVerificationData?: IPromiseBasedObservable<SendPhoneVerificationResponse>;
  codeVerificationData?: IPromiseBasedObservable<VerifyCodeResponse>;
  forgotPasswordData?: IPromiseBasedObservable<ForgotPasswordResponse>;
  resetPasswordData?: IPromiseBasedObservable<ResetPasswordResponse>;

  isAuth = false;
  token: string | null = null;

  tempData: {
    phone?: string;
    login?: string;
    password?: string;
    verificationRequestId?: string;
    verificationCode?: string;
    verificationToken?: string;
    resetToken?: string;
  } = {};

  username = '';
  verificationCode = '';
  verificationRequestId = '';
  phone = '';

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  init = async () => {
    await loadAccessTokenOnce();
    const token = getAccessToken();
    if (token) {
      this.isAuth = true;
      this.token = token;
    }
  };

  setTempData(data: Partial<typeof this.tempData>) {
    this.tempData = { ...this.tempData, ...data };

    if (data.login !== undefined) this.username = data.login;
    if (data.verificationCode !== undefined)
      this.verificationCode = data.verificationCode;
    if (data.verificationRequestId !== undefined)
      this.verificationRequestId = data.verificationRequestId;
    if (data.phone !== undefined) this.phone = data.phone;
  }

  clearTempData() {
    this.tempData = {};
    this.username = '';
    this.verificationCode = '';
    this.verificationRequestId = '';
    this.phone = '';
  }

  setAuthData(
    data: Partial<{
      username: string;
      verificationCode: string;
      verificationRequestId: string;
      phone: string;
    }>,
  ) {
    this.setTempData({
      login: data.username,
      verificationCode: data.verificationCode,
      verificationRequestId: data.verificationRequestId,
      phone: data.phone,
    });
  }

  get hasLogin() {
    return !!(this.tempData.login || this.username);
  }

  get hasVerificationToken() {
    return !!(
      this.tempData.verificationToken ||
      this.tempData.verificationRequestId ||
      this.verificationRequestId
    );
  }

  get maskedPhone() {
    const phone = this.tempData.phone || this.phone;
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    return phone;
  }

  // ================= ACTIONS =================
  loginAction = async (data: LoginRequest): Promise<boolean> => {
    try {
      console.log('loginAction called with:', data);
      const promise = loginRequest(data);
      this.loginData = fromPromise(promise);

      const response = await promise;
      console.log('loginAction response:', response);

      runInAction(() => {
        this.isAuth = true;
        this.token = response.accessToken;
      });

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      console.log('Token saved:', this.token);
      console.log('isAuth:', this.isAuth);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  registerAction = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const promise = registerRequest(data);
      this.registerData = fromPromise(promise);

      const response = await promise;

      this.isAuth = true;
      this.token = response.accessToken;
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  sendPhoneVerificationAction = async (data: SendPhoneVerificationRequest) => {
    try {
      const promise = sendPhoneVerificationRequest(data);
      this.phoneVerificationData = fromPromise(promise);
      await promise;
    } catch (error) {
      console.error('Send phone verification error:', error);
    }
  };

  verifyCodeAction = async (data: VerifyCodeRequest) => {
    try {
      const promise = verifyCodeRequest(data);
      this.codeVerificationData = fromPromise(promise);
      await promise;
    } catch (error) {
      console.error('Verify code error:', error);
    }
  };

  forgotPasswordAction = async (
    data: ForgotPasswordRequest,
  ): Promise<string | null> => {
    try {
      const promise = forgotPasswordRequest(data);
      this.forgotPasswordData = fromPromise(promise);

      const response = await promise;
      return response.requestId;
    } catch (error) {
      console.error('Forgot password error:', error);
      return null;
    }
  };

  resetPasswordAction = async (
    data: ResetPasswordRequest,
  ): Promise<boolean> => {
    try {
      const promise = resetPasswordRequest(data);
      this.resetPasswordData = fromPromise(promise);

      const response = await promise;
      return response.success;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  logoutAction = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      runInAction(() => {
        this.isAuth = false;
        this.token = null;
        this.clearTempData();
      });
      clearAccessToken();
    }
  };
}

export const authStore = new AuthStore();
