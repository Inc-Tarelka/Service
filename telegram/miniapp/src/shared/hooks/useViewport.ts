import { useStore } from 'app/StoreProvider';

export const useViewport = () => {
  const { viewportStore } = useStore();

  return {
    isExpanded: viewportStore.isExpanded,
    viewportHeight: viewportStore.viewportHeight,
    shouldShowNavbar: viewportStore.shouldShowNavbar,
    isFullscreen: viewportStore.isFullscreen,
  };
};
