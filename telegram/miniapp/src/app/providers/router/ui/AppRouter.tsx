import { memo, Suspense, useCallback } from 'react';
import { Route, RouteProps, Routes } from 'react-router-dom';
import {
  MyAppRoutes,
  routeConfig,
} from 'shared/config/routeConfig/routeConfig';
import { LoaderPage } from 'widgets/LoaderPage/ui/LoaderPage';
import { Layout } from './AppLayout';

export const AppRouter = () => {
  const renderWithWrapper = useCallback((route: RouteProps & MyAppRoutes) => {
    const element = (
      <Suspense fallback={<LoaderPage />}>{route.element}</Suspense>
    );

    return (
      <Route
        key={route.path}
        path={route.path}
        element={route.hideLayout ? element : <Layout>{element}</Layout>}
      />
    );
  }, []);

  return <Routes>{Object.values(routeConfig).map(renderWithWrapper)}</Routes>;
};

export default memo(AppRouter);
