import { makeAutoObservable } from 'mobx';
import WebApp from '@twa-dev/sdk';

export class ViewportStore {
  isExpanded: boolean = false;
  viewportHeight: number = 0;
  isFullscreen: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  init() {
    this.updateViewportState();

    WebApp.onEvent('viewportChanged', this.handleViewportChange);

    if (WebApp.isVersionAtLeast('8.0')) {
      WebApp.onEvent('fullscreenChanged', this.handleFullscreenChange);
    }
  }

  private handleViewportChange = () => {
    this.updateViewportState();
  };

  private handleFullscreenChange = () => {
    this.isFullscreen = WebApp.isFullscreen;
  };

  private updateViewportState() {
    this.isExpanded = WebApp.isExpanded;
    this.viewportHeight = WebApp.viewportHeight;
    this.isFullscreen = WebApp.isFullscreen;
  }

  get shouldShowNavbar(): boolean {
    return this.isFullscreen;
  }

  destroy() {
    WebApp.offEvent('viewportChanged', this.handleViewportChange);
    WebApp.offEvent('fullscreenChanged', this.handleFullscreenChange);
  }
}
