import { makeAutoObservable } from 'mobx';

export class CarouselHeightStore {
  slideHeights: Map<number, number> = new Map();
  activeIndex: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setSlideHeight(index: number, height: number) {
    this.slideHeights.set(index, height);
  }

  setActiveIndex(index: number) {
    this.activeIndex = index;
  }

  get activeSlideHeight(): number {
    return this.slideHeights.get(this.activeIndex) ?? 0;
  }

  reset() {
    this.slideHeights.clear();
    this.activeIndex = 0;
  }
}
