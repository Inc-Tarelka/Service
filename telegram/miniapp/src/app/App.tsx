import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';
import { Suspense, useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { loadAccessTokenOnce } from 'shared/api/base';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';
import { useViewport } from 'shared/hooks/useViewport';
import { ensureTelegramFullscreen } from 'shared/lib/utils/telegram-fullscreen';
import classNames from 'shared/library/ClassNames/classNames';
import { RootStore } from 'shared/store/root-store';
import { Navbar } from 'widgets/Navbar';
import { WelcomeScreen } from 'widgets/WelcomeScreen';
import { AppLoader } from './providers';
import { AppRouter } from './providers/router';
import { useTheme } from './providers/ThemeProvider/lib/useTheme';
import { RootStoreContext, useStore } from './StoreProvider/ui/StoreProvider';
import { NotInTelegramPlaceholderLazy } from 'widgets/NotInTelegramPlaceholder';

const rootStore = new RootStore();

const isTelegramMiniApp = (): boolean => {
  if (!WebApp.initData || WebApp.initData.length === 0) {
    return false;
  }

  if (typeof window !== 'undefined') {
    return (
      typeof (window as any).TelegramWebviewProxy !== 'undefined' ||
      !!WebApp.initDataUnsafe?.user
    );
  }

  return false;
};

const AppContent = observer(() => {
  const { theme } = useTheme();
  const location = useLocation();
  // @ts-expect-error: Он используется при вмонтировании в компонент App.tsx
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated } = useAuth();
  const { shouldShowNavbar } = useViewport();
  const { viewportStore } = useStore();
  const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);

  const currentRoute = Object.values(routeConfig).find((route) =>
    route.path ? matchPath(route.path as string, location.pathname) : false,
  );

  useEffect(() => {
    const inTelegram = isTelegramMiniApp();
    setIsInTelegram(inTelegram);

    if (!inTelegram) {
      console.warn('Приложение открыто не в Telegram Mini App');
      return;
    }

    try {
      loadAccessTokenOnce();
      WebApp.disableVerticalSwipes();
      WebApp.enableClosingConfirmation();
      WebApp.SettingsButton.show();

      viewportStore.init();
      ensureTelegramFullscreen();
    } catch (error) {
      console.error('Ошибка инициализации WebApp:', error);
    }

    return () => {
      if (inTelegram) {
        viewportStore.destroy();
      }
    };
  }, [viewportStore]);

  useEffect(() => {
    if (!isInTelegram) {
      return;
    }

    ensureTelegramFullscreen();

    const retryId = window.setTimeout(() => {
      ensureTelegramFullscreen();
    }, 250);

    return () => {
      window.clearTimeout(retryId);
    };
  }, [isInTelegram, location.pathname]);

  useEffect(() => {
    if (!isInTelegram) {
      return;
    }

    const handleFocus = () => {
      if (document.visibilityState !== 'hidden') {
        ensureTelegramFullscreen();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInTelegram]);

  if (isInTelegram === null) {
    return null;
  }

  if (!isInTelegram) {
    return (
      <Suspense fallback={<WelcomeScreen />}>
        <NotInTelegramPlaceholderLazy />
      </Suspense>
    );
  }

  const renderNavbar = () => {
    if (!shouldShowNavbar) return null;
    return <Navbar hideLogo={!!currentRoute?.hideNavbar} />;
  };

  return (
    <div className={classNames('app', {}, [theme])}>
      {renderNavbar()}
      <div className="content-page">
        <AppRouter />
      </div>
    </div>
  );
});

function App() {
  return (
    <RootStoreContext.Provider value={rootStore}>
      <AppLoader splashScreen={<WelcomeScreen />} minDisplayTime={800}>
        <AppContent />
      </AppLoader>
    </RootStoreContext.Provider>
  );
}

export default App;
