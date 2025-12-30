import { MainPage } from 'pages/MainPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { WelcomePage } from 'pages/WelcomePage';
import { RouteProps } from 'react-router-dom';

export interface MyAppRoutes {
  hideLayout?: boolean;
}

export enum AppRoutes {
  MAIN = 'main',
  WELCOME = 'welcome',
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: '/main',
  [AppRoutes.WELCOME]: '/',
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
    element: <WelcomePage />,
    hideLayout: true,
  },
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};
