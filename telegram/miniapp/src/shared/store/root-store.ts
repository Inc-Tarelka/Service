import { WebAppStore } from './web-app-store';
import { ViewportStore } from './viewport-store';

export class RootStore {
  webAppStore = new WebAppStore();
  viewportStore = new ViewportStore();
}
