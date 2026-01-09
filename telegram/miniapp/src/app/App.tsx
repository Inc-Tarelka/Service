import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { loadAccessTokenOnce } from 'shared/api/base';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { useAuth } from 'shared/hooks/useAuth';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import { RootStore } from 'shared/store/root-store';
import { Navbar } from 'widgets/Navbar';
import { WelcomeScreen } from 'widgets/WelcomeScreen';
import { AppLoader } from './providers';
import { AppRouter } from './providers/router';
import { useTheme } from './providers/ThemeProvider/lib/useTheme';
import { RootStoreContext, useStore } from './StoreProvider/ui/StoreProvider';

const rootStore = new RootStore();

const AppContent = observer(() => {
  const { theme } = useTheme();
  const location = useLocation();
  // @ts-expect-error: Он используется при вмонтировании в компонент App.tsx
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated } = useAuth();
  const { shouldShowNavbar } = useViewport();
  const { viewportStore } = useStore();

  const currentRoute = Object.values(routeConfig).find((route) =>
    route.path ? matchPath(route.path as string, location.pathname) : false,
  );

  useEffect(() => {
    loadAccessTokenOnce();
    WebApp.disableVerticalSwipes();
    WebApp.enableClosingConfirmation();
    WebApp.SettingsButton.show();

    viewportStore.init();

    return () => {
      viewportStore.destroy();
    };
  }, [viewportStore]);

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
