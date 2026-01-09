import { ReactNode } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { TabBar } from 'widgets/TabBar';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentRoute = Object.values(routeConfig).find((route) =>
    route.path ? matchPath(route.path as string, location.pathname) : false,
  );

  if (currentRoute?.hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <TabBar />
    </>
  );
};
