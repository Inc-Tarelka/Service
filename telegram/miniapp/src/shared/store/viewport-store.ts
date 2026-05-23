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
import { ensureTelegramFullscreen } from 'shared/lib/utils/telegram-fullscreen';
export class ViewportStore {
  isExpanded: boolean = false;
  viewportHeight: number = 0;
  isFullscreen: boolean = false;
  platform: string = 'unknown';

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
    ensureTelegramFullscreen();
    this.updateViewportState();

    WebApp.onEvent('viewportChanged', this.handleViewportChange);

    if (WebApp.isVersionAtLeast('8.0')) {
      WebApp.onEvent('fullscreenChanged', this.handleFullscreenChange);
      WebApp.onEvent('fullscreenFailed', this.handleFullscreenFailed);
    }
  }

  private handleViewportChange = () => {
    ensureTelegramFullscreen();
    this.updateViewportState();
  };

  private handleFullscreenChange = () => {
    ensureTelegramFullscreen();
    this.updateViewportState();
  };

  private handleFullscreenFailed = (params: { error: string }) => {
    console.warn('Fullscreen failed:', params.error);
  };

  private updateViewportState() {
    this.isExpanded = WebApp.isExpanded;
    this.viewportHeight = WebApp.viewportHeight;
    this.isFullscreen = WebApp.isFullscreen;
    this.platform = WebApp.platform;
  }

  get isFullsize(): boolean {
    return this.isExpanded && !this.isFullscreen;
  }

  get shouldShowNavbar(): boolean {
    return !this.isDesktopDevice && !this.isFullsize;
  }

  get isDesktop(): boolean {
    return this.isDesktopDevice;
  }

  get isMobile(): boolean {
    return this.isMobileDevice;
  }

  destroy() {
    WebApp.offEvent('viewportChanged', this.handleViewportChange);
    if (WebApp.isVersionAtLeast('8.0')) {
      WebApp.offEvent('fullscreenChanged', this.handleFullscreenChange);
      WebApp.offEvent('fullscreenFailed', this.handleFullscreenFailed);
    }
  }
}
