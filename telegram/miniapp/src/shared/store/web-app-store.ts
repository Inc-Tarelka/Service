import { WebAppInitData } from '@twa-dev/types';
import { makeAutoObservable } from 'mobx';

export class WebAppStore {
  initDataUnsafe: WebAppInitData | null = null;
  initData: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.setInitData();
  }

  setInitData() {
    const webApp = window.Telegram?.WebApp;
    this.initDataUnsafe = webApp?.initDataUnsafe ?? null;
    this.initData = webApp?.initData ?? null;
  }
}
