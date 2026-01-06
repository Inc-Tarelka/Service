import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { useViewport } from 'shared/hooks/useViewport';
import { classNames } from 'shared/library/ClassNames/classNames';
import s from './Page.module.scss';

interface PageProps {
  className?: string;
  children?: ReactNode;
  withNavbar?: boolean;
}

export const Page = (props: PageProps) => {
  const { className, children, withNavbar = true } = props;
  const { isDesktop, shouldShowNavbar } = useViewport();
  const location = useLocation();

  const currentRoute = Object.values(routeConfig).find(
    (route) => route.path === location.pathname,
  );

  const isNavbarVisible =
    withNavbar && shouldShowNavbar && !currentRoute?.hideNavbar;

  return (
    <main
      className={classNames(s.Page, { [s.desktop]: isDesktop }, [className])}
    >
      {isNavbarVisible && !isDesktop && <div className={s.spacer} />}
      {children}
    </main>
  );
};
