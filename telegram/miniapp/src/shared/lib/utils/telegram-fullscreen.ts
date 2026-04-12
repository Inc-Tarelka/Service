import WebApp from '@twa-dev/sdk';
const REQUEST_COOLDOWN_MS = 500;

let lastFullscreenRequestAt = 0;
let isReadySent = false;
const NAVBAR_BASE_HEIGHT_PX = 48;

const toPx = (value: number | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0px';
  }

  return `${Math.max(0, value)}px`;
};

const isTelegramRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(window.Telegram?.WebApp);
};

const canRequestFullscreen = (): boolean => {
  if (!isTelegramRuntime()) {
    return false;
  }

  if (!WebApp.isVersionAtLeast('8.0')) {
    return false;
  }

  if (typeof WebApp.requestFullscreen !== 'function') {
    return false;
  }

  if (WebApp.isFullscreen) {
    return false;
  }

  return true;
};

const applyTelegramRuntimeCssVars = (): void => {
  if (typeof document === 'undefined' || !isTelegramRuntime()) {
    return;
  }

  const root = document.documentElement;
  const safeAreaInset = WebApp.safeAreaInset;
  const contentSafeAreaInset = WebApp.contentSafeAreaInset;
  const safeTop = Math.max(0, Number(safeAreaInset?.top ?? 0));
  const shouldReserveNavbarHeight = WebApp.isFullscreen || !WebApp.isExpanded;
  const pageTopOffset = shouldReserveNavbarHeight
    ? NAVBAR_BASE_HEIGHT_PX + safeTop
    : safeTop;

  root.style.setProperty('--tg-viewport-height', toPx(WebApp.viewportHeight));
  root.style.setProperty(
    '--tg-viewport-stable-height',
    toPx(WebApp.viewportStableHeight),
  );
  root.style.setProperty('--tg-safe-area-inset-top', toPx(safeAreaInset?.top));
  root.style.setProperty(
    '--tg-safe-area-inset-right',
    toPx(safeAreaInset?.right),
  );
  root.style.setProperty(
    '--tg-safe-area-inset-bottom',
    toPx(safeAreaInset?.bottom),
  );
  root.style.setProperty(
    '--tg-safe-area-inset-left',
    toPx(safeAreaInset?.left),
  );
  root.style.setProperty(
    '--tg-content-safe-area-inset-top',
    toPx(contentSafeAreaInset?.top),
  );
  root.style.setProperty(
    '--tg-content-safe-area-inset-right',
    toPx(contentSafeAreaInset?.right),
  );
  root.style.setProperty(
    '--tg-content-safe-area-inset-bottom',
    toPx(contentSafeAreaInset?.bottom),
  );
  root.style.setProperty(
    '--tg-content-safe-area-inset-left',
    toPx(contentSafeAreaInset?.left),
  );
  root.style.setProperty('--tg-page-top-offset', `${pageTopOffset}px`);
  root.style.setProperty(
    '--tg-navbar-base-height',
    `${NAVBAR_BASE_HEIGHT_PX}px`,
  );
};

const sendReadyOnce = (): void => {
  if (isReadySent) {
    return;
  }

  if (typeof WebApp.ready !== 'function') {
    return;
  }

  isReadySent = true;

  try {
    WebApp.ready();
  } catch (error) {
    console.warn('[TelegramFullscreen] Failed to send ready()', error);
  }
};

export const ensureTelegramFullscreen = (): void => {
  if (!isTelegramRuntime()) {
    return;
  }

  try {
    applyTelegramRuntimeCssVars();
    WebApp.expand();

    if (typeof WebApp.disableVerticalSwipes === 'function') {
      WebApp.disableVerticalSwipes();
    }

    if (!canRequestFullscreen()) {
      applyTelegramRuntimeCssVars();
      return;
    }

    const now = Date.now();
    if (now - lastFullscreenRequestAt < REQUEST_COOLDOWN_MS) {
      return;
    }

    lastFullscreenRequestAt = now;
    WebApp.requestFullscreen();
    applyTelegramRuntimeCssVars();
  } catch (error) {
    console.warn('[TelegramFullscreen] Failed to ensure fullscreen', error);
  } finally {
    sendReadyOnce();
  }
};
