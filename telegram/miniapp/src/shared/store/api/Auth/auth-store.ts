import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
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
  // Observables for async state
  loginData?: IPromiseBasedObservable<LoginResponse>;
  registerData?: IPromiseBasedObservable<RegisterResponse>;
  phoneVerificationData?: IPromiseBasedObservable<SendPhoneVerificationResponse>;
  codeVerificationData?: IPromiseBasedObservable<VerifyCodeResponse>;

  // Session state
  isAuth = false;
  token: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.token = localStorage.getItem('access_token');
    if (this.token) {
      this.isAuth = true;
    }
  }

  // ================= ACTIONS =================

  loginAction = async (data: LoginRequest): Promise<boolean> => {
    try {
      // Wrap the promise to track state (pending/fulfilled/rejected)
      const promise = loginRequest(data);
      this.loginData = fromPromise(promise);

      const response = await promise;

      this.isAuth = true;
      this.token = response.accessToken;
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
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
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
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
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isAuth = false;
      this.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };
}
