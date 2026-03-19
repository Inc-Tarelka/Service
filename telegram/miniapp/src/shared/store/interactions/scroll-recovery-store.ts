import { makeAutoObservable } from 'mobx';

export class ScrollRecoveryStore {
  scroll: Record<string, number> = {};

  constructor() {
    makeAutoObservable(this);
  }

  setScrollPosition = (path: string, position: number) => {
    this.scroll[path] = position;
  };

  getScroll = (path: string) => {
    return this.scroll[path] || 0;
  };
}
