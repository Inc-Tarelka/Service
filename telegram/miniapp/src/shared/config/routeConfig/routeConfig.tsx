import { AuthPage } from 'pages/AuthPage';
import { MainPage } from 'pages/MainPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { WelcomePage } from 'pages/WelcomePage';
import { ProfilePage } from 'pages/profile';
import { UserProfilePage } from 'pages/user-profile';
import { RouteProps } from 'react-router-dom';

export interface MyAppRoutes {
  hideLayout?: boolean;
  hideNavbar?: boolean;
}

export enum AppRoutes {
  MAIN = 'main',
  WELCOME = 'welcome',
  AUTH = 'auth',
  PROFILE = 'profile',
  USER_PROFILE = 'user_profile',
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: '/',
  [AppRoutes.WELCOME]: '/welcome',
  [AppRoutes.AUTH]: '/auth', // /auth?step=login|register|confirm|...
  [AppRoutes.PROFILE]: '/profile',
  [AppRoutes.USER_PROFILE]: '/profile/:id',
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutes, RouteProps & MyAppRoutes> = {
  [AppRoutes.MAIN]: {
    path: RoutePath.main,
    hideNavbar: true,
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
  [AppRoutes.PROFILE]: {
    path: RoutePath.profile,
    hideNavbar: true,
    element: <ProfilePage />,
  },
  [AppRoutes.USER_PROFILE]: {
    path: RoutePath.user_profile,
    hideNavbar: true,
    element: <UserProfilePage />,
  },
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};
