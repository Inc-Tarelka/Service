import { makeAutoObservable, runInAction } from 'mobx';
import {
  sendPhoneVerificationRequest,
  verifyCodeRequest,
} from 'shared/api/service/Auth/api';

export class VerificationStore {
  isLoading = false;
  requestId: string | null = null;
  error: string | null = null;
  verificationCode: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  sendCode = async (phone: string): Promise<boolean> => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await sendPhoneVerificationRequest({
        PhoneNumber: phone,
      });
      runInAction(() => {
        this.requestId = response.requestId;
        this.isLoading = false;
      });
      return true;
    } catch (error: any) {
      console.error('Send code error:', error);
      runInAction(() => {
        this.error = error.message || 'Ошибка отправки кода';
        this.isLoading = false;
      });
      return false;
    }
  };

  verifyCode = async (code: string): Promise<boolean> => {
    if (!this.requestId) {
      this.error = 'ID запроса не найден';
      return false;
    }

    this.isLoading = true;
    this.error = null;
    try {
      const response = await verifyCodeRequest({
        verificationCode: code,
        verificationRequestId: this.requestId,
      });

      if (response.status === 'ok') {
        runInAction(() => {
          this.verificationCode = code;
          this.isLoading = false;
        });
        return true;
      } else {
        runInAction(() => {
          this.error = 'Неверный код';
          this.isLoading = false;
        });
        return false;
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      runInAction(() => {
        this.error = error.message || 'Ошибка проверки кода';
        this.isLoading = false;
      });
      return false;
    }
  };

  reset() {
    this.requestId = null;
    this.error = null;
    this.verificationCode = null;
    this.isLoading = false;
  }
}

export const verificationStore = new VerificationStore();
