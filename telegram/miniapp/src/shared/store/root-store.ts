import { AuthStore } from './api/Auth/auth-store';
import { ReferenceStore } from './api/Reference/reference-store';
import { ViewportStore } from './viewport-store';
import { WebAppStore } from './web-app-store';

export class RootStore {
  webAppStore = new WebAppStore();
  viewportStore = new ViewportStore();
  authStore = new AuthStore();
  referenceStore = new ReferenceStore();
}
