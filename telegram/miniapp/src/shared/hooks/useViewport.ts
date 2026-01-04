import { useStore } from 'app/StoreProvider';

export const useViewport = () => {
  const { viewportStore } = useStore();

  return {
    isExpanded: viewportStore.isExpanded,
    viewportHeight: viewportStore.viewportHeight,
    shouldShowNavbar: viewportStore.shouldShowNavbar,
    isFullscreen: viewportStore.isFullscreen,
    isDesktop: viewportStore.isDesktop,
    isMobile: viewportStore.isMobile,
    isTablet: viewportStore.isTabletDevice,
    isAndroid: viewportStore.isAndroidDevice,
    isIOS: viewportStore.isIOSDevice,
  };
};
