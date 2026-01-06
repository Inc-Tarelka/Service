import WebApp from '@twa-dev/sdk';
import { makeAutoObservable } from 'mobx';
import {
  isAndroid,
  isDesktop,
  isIOS,
  isMobile,
  isTablet,
  osName,
  osVersion,
} from 'react-device-detect';

export class ViewportStore {
  isExpanded: boolean = false;
  viewportHeight: number = 0;
  isFullscreen: boolean = false;
  platform: string = 'unknown';

  // Device detection flags
  readonly isDesktopDevice = isDesktop;
  readonly isMobileDevice = isMobile;
  readonly isTabletDevice = isTablet;
  readonly isAndroidDevice = isAndroid;
  readonly isIOSDevice = isIOS;
  readonly osName = osName;
  readonly osVersion = osVersion;

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
    this.platform = WebApp.platform;
  }

  get shouldShowNavbar(): boolean {
    return !this.isDesktop;
  }

  get isDesktop(): boolean {
    return this.isDesktopDevice;
  }

  get isMobile(): boolean {
    return this.isMobileDevice;
  }

  destroy() {
    WebApp.offEvent('viewportChanged', this.handleViewportChange);
    WebApp.offEvent('fullscreenChanged', this.handleFullscreenChange);
  }
}
