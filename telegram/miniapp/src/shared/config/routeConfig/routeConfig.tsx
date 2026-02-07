import { AuthPage } from 'pages/AuthPage';
import { CollaboratorsPage } from 'pages/CollaboratorsPage';
import { MainPage } from 'pages/MainPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { NotificationsPage } from 'pages/NotificationsPage';
import { PostPage } from 'pages/PostPage';
import { ProfilePage } from 'pages/ProfilePage';
import { SettingsPage } from 'pages/SettingsPage';
import { UserProfilePage } from 'pages/UserProfilePage';
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
  PROFILE = 'profile',
  USER_PROFILE = 'user_profile',
  COLLABORATORS = 'collaborators',
  POST = 'post',
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications',
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: '/',
  [AppRoutes.WELCOME]: '/welcome',
  [AppRoutes.AUTH]: '/auth', // /auth?step=login|register|confirm|...
  [AppRoutes.PROFILE]: '/profile',
  [AppRoutes.USER_PROFILE]: '/profile/:id',
  [AppRoutes.COLLABORATORS]: '/collaborators',
  [AppRoutes.POST]: '/post',
  [AppRoutes.SETTINGS]: '/settings', // /settings?section=profile|security|notifications|terms
  [AppRoutes.NOTIFICATIONS]: '/notifications',
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
  [AppRoutes.COLLABORATORS]: {
    path: RoutePath.collaborators,
    hideNavbar: true,
    element: <CollaboratorsPage />,
  },
  [AppRoutes.POST]: {
    path: RoutePath.post,
    hideNavbar: true,
    hideLayout: true,
    element: <PostPage />,
  },
  [AppRoutes.SETTINGS]: {
    path: RoutePath.settings,
    hideNavbar: true,
    hideLayout: true,
    element: <SettingsPage />,
  },
  [AppRoutes.NOTIFICATIONS]: {
    path: RoutePath.notifications,
    element: <NotificationsPage />,
  },
  // ДОЛЖНО БЫТЬ ПОСЛЕДНИМ
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};
