import { makeAutoObservable, runInAction } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loadAccessTokenOnce,
  setAccessToken,
  setRefreshToken,
} from 'shared/api/base';
import {
  getStoredReferralSenderId,
  persistReferralSenderIdFromStartParam,
  setStoredReferralSenderId,
} from 'shared/lib/utils/telegram-startapp';
import {
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  preRegisterRequest,
  registerRequest,
  resetPasswordRequest,
  sendPhoneVerificationRequest,
  telegramRegisterRequest,
  verifyCodeRequest,
} from 'shared/api/service/Auth/api';
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  PreRegisterRequest,
  PreRegisterResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SendPhoneVerificationRequest,
  SendPhoneVerificationResponse,
  TelegramRegisterRequest,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from 'shared/api/service/Auth/types';

export class AuthStore {
  loginData?: IPromiseBasedObservable<LoginResponse>;
  preRegisterData?: IPromiseBasedObservable<PreRegisterResponse>;
  registerData?: IPromiseBasedObservable<RegisterResponse>;
  phoneVerificationData?: IPromiseBasedObservable<SendPhoneVerificationResponse>;
  codeVerificationData?: IPromiseBasedObservable<VerifyCodeResponse>;
  forgotPasswordData?: IPromiseBasedObservable<ForgotPasswordResponse>;
  resetPasswordData?: IPromiseBasedObservable<ResetPasswordResponse>;

  isAuth = false;
  token: string | null = null;
  registrationSenderId: string | null = null;
  registrationBlocked = false;

  tempData: {
    phone?: string;
    login?: string;
    password?: string;
    accountType?: string;
    userId?: number;
    verificationRequestId?: string;
    verificationCode?: string;
    verificationToken?: string;
    resetToken?: string;
    senderId?: string;
  } = {};

  username = '';
  verificationCode = '';
  verificationRequestId = '';
  phone = '';

  constructor() {
    makeAutoObservable(this);
    this.syncRegistrationSenderId();
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
    if (data.senderId !== undefined) {
      const normalizedSenderId = data.senderId.trim();
      if (normalizedSenderId) {
        this.setRegistrationSenderId(normalizedSenderId);
      }
    }
  }

  setRegistrationSenderId = (senderId: string) => {
    const normalizedSenderId = senderId.trim();
    if (!normalizedSenderId) {
      return;
    }

    this.registrationSenderId = normalizedSenderId;
    this.tempData.senderId = normalizedSenderId;
    this.registrationBlocked = false;
    setStoredReferralSenderId(normalizedSenderId);
  };

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

  get hasRegistrationSenderId() {
    return !!(
      this.tempData.senderId?.trim() ||
      this.registrationSenderId?.trim() ||
      getStoredReferralSenderId()
    );
  }

  syncRegistrationSenderId = (startParam?: string | null): string | null => {
    const senderIdFromStart = persistReferralSenderIdFromStartParam(startParam);
    if (senderIdFromStart) {
      this.setRegistrationSenderId(senderIdFromStart);
      return senderIdFromStart;
    }

    const senderIdFromTemp = this.tempData.senderId?.trim();
    if (senderIdFromTemp) {
      this.setRegistrationSenderId(senderIdFromTemp);
      return senderIdFromTemp;
    }

    if (this.registrationSenderId) {
      return this.registrationSenderId;
    }

    const senderIdFromStorage = getStoredReferralSenderId();
    if (senderIdFromStorage) {
      this.setRegistrationSenderId(senderIdFromStorage);
      return senderIdFromStorage;
    }

    return null;
  };

  private resolveRegistrationSenderId = (): string | null => {
    const senderId = this.syncRegistrationSenderId();
    if (!senderId) {
      this.registrationBlocked = true;
      return null;
    }

    this.registrationBlocked = false;
    this.tempData.senderId = senderId;
    this.registrationSenderId = senderId;
    return senderId;
  };

  // ================= ACTIONS =================

  loginAction = async (data: LoginRequest): Promise<boolean> => {
    try {
      const promise = loginRequest(data);
      this.loginData = fromPromise(promise);

      const response = await promise;

      runInAction(() => {
        this.isAuth = true;
        this.token = response.accessToken;
      });

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  preRegisterAction = async (
    data: Omit<PreRegisterRequest, 'senderId'>,
  ): Promise<number | null> => {
    try {
      const senderId = this.resolveRegistrationSenderId();
      if (!senderId) {
        return null;
      }

      const promise = preRegisterRequest({ ...data, senderId });
      this.preRegisterData = fromPromise(promise);

      const response = await promise;
      return response.userId;
    } catch (error) {
      console.error('Pre-register error:', error);
      return null;
    }
  };

  preRegisterAndSendCodeAction = async (params: {
    initData: string;
    account: PreRegisterRequest['account'];
  }): Promise<boolean> => {
    try {
      const userId = await this.preRegisterAction({
        initData: params.initData,
        account: params.account,
      });
      if (userId === null) return false;

      this.setTempData({ userId });

      const sendPromise = sendPhoneVerificationRequest({
        PhoneNumber: params.account.phone,
      });
      this.phoneVerificationData = fromPromise(sendPromise);
      const sendResponse = await sendPromise;

      this.setTempData({ verificationRequestId: sendResponse.requestId });
      return true;
    } catch (error) {
      console.error('Pre-register flow error:', error);
      return false;
    }
  };

  telegramRegistrationAction = async (
    data: TelegramRegisterRequest,
  ): Promise<boolean> => {
    try {
      const senderId = this.resolveRegistrationSenderId();
      if (!senderId) {
        return false;
      }

      const payload: TelegramRegisterRequest = { ...data, senderId };

      const promise = telegramRegisterRequest(payload);
      this.registerData = fromPromise(promise);

      const response = await promise;

      runInAction(() => {
        this.isAuth = true;
        this.token = response.accessToken;
      });
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      return true;
    } catch (error) {
      console.error('Telegram register error:', error);
      return false;
    }
  };

  registerAction = async (data: RegisterRequest): Promise<boolean> => {
    try {
      const promise = registerRequest(data);
      this.registerData = fromPromise(promise);

      const response = await promise;

      runInAction(() => {
        this.isAuth = true;
        this.token = response.accessToken;
      });
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
      const response = await promise;
      this.setTempData({ verificationRequestId: response.requestId });
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
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutRequest({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      runInAction(() => {
        this.isAuth = false;
        this.token = null;
        this.clearTempData();
      });
      clearTokens();
    }
  };
}

export const authStore = new AuthStore();
