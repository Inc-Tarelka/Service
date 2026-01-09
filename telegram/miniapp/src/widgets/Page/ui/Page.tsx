import { observer } from 'mobx-react-lite';
import { ReactNode } from 'react';
import { useViewport } from 'shared/hooks/useViewport';
import { classNames } from 'shared/library/ClassNames/classNames';
import s from './Page.module.scss';

interface PageProps {
  className?: string;
  children?: ReactNode;
  noPaddingBottom?: boolean;
}

export const Page = observer((props: PageProps) => {
  const { className, children, noPaddingBottom } = props;
  const { isDesktop } = useViewport();

  const needsSpacer = !isDesktop;

  return (
    <main
      className={classNames(
        s.Page,
        {
          [s.desktop]: isDesktop,
          [s.withNavbar]: needsSpacer,
          [s.noPaddingBottom]: noPaddingBottom,
        },
        [className],
      )}
    >
      {needsSpacer && <div className={s.spacer} />}
      {children}
    </main>
  );
});
