import WebApp from '@twa-dev/sdk';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { loadAccessTokenOnce } from 'shared/api/base';
import { useAuth } from 'shared/hooks/useAuth';
import classNames from 'shared/library/ClassNames/classNames';
import { RootStore } from 'shared/store/root-store';
import { AppRouter } from './providers/router';
import { useTheme } from './providers/ThemeProvider/lib/useTheme';
import { RootStoreContext } from './StoreProvider/ui/StoreProvider';

const rootStore = new RootStore();

const AppContent = observer(() => {
  const { theme } = useTheme();
  // @ts-expect-error: Он используется при вмонтировании в компонент App.tsx, поэтому нет типа и аргумента
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    WebApp.ready();
    loadAccessTokenOnce();
    WebApp.expand();
    WebApp.disableVerticalSwipes();
    WebApp.enableClosingConfirmation();
    WebApp.SettingsButton.show();
  }, []);

  return (
    <div className={classNames('app', {}, [theme])}>
      <div className="content-page">
        <AppRouter />
      </div>
    </div>
  );
});

function App() {
  return (
    <RootStoreContext.Provider value={rootStore}>
      <AppContent />
    </RootStoreContext.Provider>
  );
}

export default App;
