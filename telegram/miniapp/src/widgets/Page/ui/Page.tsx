import { ReactNode } from 'react';
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
  const { isDesktop } = useViewport();

  return (
    <main
      className={classNames(s.Page, { [s.desktop]: isDesktop }, [className])}
    >
      {withNavbar && !isDesktop && <div className={s.spacer} />}
      {children}
    </main>
  );
};
