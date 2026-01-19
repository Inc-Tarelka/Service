import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { loadAccessTokenOnce } from 'shared/api/base';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import { RootStore } from 'shared/store/root-store';
import { Navbar } from 'widgets/Navbar';
import { NotInTelegramPlaceholder } from 'widgets/NotInTelegramPlaceholder';
import { WelcomeScreen } from 'widgets/WelcomeScreen';
import { AppLoader } from './providers';
import { AppRouter } from './providers/router';
import { useTheme } from './providers/ThemeProvider/lib/useTheme';
import { RootStoreContext, useStore } from './StoreProvider/ui/StoreProvider';

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
      if (WebApp.isVersionAtLeast('6.1')) {
        WebApp.CloudStorage.setItem('access_token', '');
      }
      loadAccessTokenOnce();
      WebApp.disableVerticalSwipes();
      WebApp.enableClosingConfirmation();
      WebApp.SettingsButton.show();

      viewportStore.init();
    } catch (error) {
      console.error('Ошибка инициализации WebApp:', error);
    }

    return () => {
      if (inTelegram) {
        viewportStore.destroy();
      }
    };
  }, [viewportStore]);

  if (isInTelegram === null) {
    return <WelcomeScreen />;
  }

  if (!isInTelegram) {
    return <NotInTelegramPlaceholder />;
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
