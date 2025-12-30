import { ReactNode } from 'react';
import s from './Page.module.scss';
import { classNames } from 'shared/library/ClassNames/classNames';

interface PageProps {
  className?: string;
  children?: ReactNode;
}

export const Page = (props: PageProps) => {
  const { className, children } = props;

  return (
    <main className={classNames(s.Page, {}, [className])}>{children}</main>
  );
};
