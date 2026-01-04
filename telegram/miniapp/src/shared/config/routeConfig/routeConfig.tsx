import { AuthPage } from 'pages/AuthPage';
import { MainPage } from 'pages/MainPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { WelcomePage } from 'pages/WelcomePage';
import { RouteProps } from 'react-router-dom';

export interface MyAppRoutes {
  hideLayout?: boolean;
  hideNavbar?: boolean;
}

export enum AppRoutes {
  MAIN = 'main',
  WELCOME = 'welcome',
  AUTH = 'auth',
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: '/',
  [AppRoutes.WELCOME]: '/welcome',
  [AppRoutes.AUTH]: '/auth', // /auth?step=login|register|confirm|...
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutes, RouteProps & MyAppRoutes> = {
  [AppRoutes.MAIN]: {
    path: RoutePath.main,
    element: <MainPage />,
  },
  [AppRoutes.WELCOME]: {
    path: RoutePath.welcome,
    hideLayout: true,
    element: <WelcomePage />,
  },
  [AppRoutes.AUTH]: {
    path: RoutePath.auth,
    hideLayout: true,
    element: <AuthPage />,
  },
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};
