import { TabBar } from 'widgets/TabBar';
import { useLocation } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { ReactNode } from 'react';
export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentRoute = Object.values(routeConfig).find(
    (route) => route.path === location.pathname,
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
