import { makeAutoObservable } from 'mobx';

export class ScrollRecoveryStore {
  scroll: Record<string, number> = {};
  mainPageActiveTab: string = '';
  mainPageSearchQuery: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  setScrollPosition = (path: string, position: number) => {
    this.scroll[path] = position;
  };

  getScroll = (path: string) => {
    return this.scroll[path] || 0;
  };

  setMainPageActiveTab = (tab: string) => {
    this.mainPageActiveTab = tab;
  };

  setMainPageSearchQuery = (query: string) => {
    this.mainPageSearchQuery = query;
  };
}
