import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  clearAccessToken,
  getAccessToken,
  loadAccessTokenOnce,
  setAccessToken,
} from 'shared/api/base';
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  sendPhoneVerificationRequest,
  verifyCodeRequest,
} from 'shared/api/service/Auth/api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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

  isAuth = false;
  token: string | null = null;

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

  // ================= ACTIONS =================

  loginAction = async (data: LoginRequest): Promise<boolean> => {
    try {
      const promise = loginRequest(data);
      this.loginData = fromPromise(promise);

      const response = await promise;

      this.isAuth = true;
      this.token = response.accessToken;
      setAccessToken(response.accessToken);
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

  logoutAction = async () => {
    try {
      await logoutRequest('dummy');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isAuth = false;
      this.token = null;
      clearAccessToken();
    }
  };
}
