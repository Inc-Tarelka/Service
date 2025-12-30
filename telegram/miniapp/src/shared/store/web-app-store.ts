import { makeAutoObservable } from 'mobx';
import WebApp from '@twa-dev/sdk';
import { WebAppInitData } from '@twa-dev/types';

declare global {
  interface Window {
    Telegram: {
      WebApp: typeof WebApp;
    };
  }
}

export class WebAppStore {
  initDataUnsafe: WebAppInitData | null = null;
  initData: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.setInitData();
  }

  setInitData() {
    const webApp = window.Telegram.WebApp;
    this.initDataUnsafe = webApp?.initDataUnsafe ?? null;
    this.initData = webApp?.initData ?? null;
  }
}
