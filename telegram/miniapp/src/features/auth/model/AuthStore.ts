import { makeAutoObservable } from 'mobx';

import { AccountType, TempAuthData } from './types';

/**
 * MobX Store для хранения временных данных авторизации между шагами
 */
class AuthStoreClass {
  tempData: TempAuthData = {};

  constructor() {
    makeAutoObservable(this);
  }

  setTempData(data: Partial<TempAuthData>) {
    this.tempData = { ...this.tempData, ...data };
  }

  clearTempData() {
    this.tempData = {};
  }

  setAccountType(type: AccountType) {
    this.tempData.accountType = type;
  }

  get hasVerificationToken() {
    return !!this.tempData.verificationToken;
  }

  get hasResetToken() {
    return !!this.tempData.resetToken;
  }

  get hasLogin() {
    return !!this.tempData.login;
  }

  get hasPhone() {
    return !!this.tempData.phone;
  }

  get accountType() {
    return this.tempData.accountType;
  }

  get isCompany() {
    return this.tempData.accountType === 'company';
  }

  get isSpecialist() {
    return this.tempData.accountType === 'specialist';
  }

  get maskedPhone() {
    const phone = this.tempData.phone;
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    return phone;
  }
}

export const authStore = new AuthStoreClass();
