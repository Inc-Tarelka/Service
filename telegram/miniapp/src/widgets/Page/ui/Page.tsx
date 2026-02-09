import { useStore } from 'app/StoreProvider';
import { observer } from 'mobx-react-lite';
import { ReactNode, UIEvent, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useInitialEffect } from 'shared/hooks/useInitialEffect';
import { useThrottle } from 'shared/hooks/useThrottle';
import { useViewport } from 'shared/hooks/useViewport';
import { classNames } from 'shared/library/ClassNames/classNames';
import s from './Page.module.scss';

interface PageProps {
  className?: string;
  children?: ReactNode;
  noPaddingBottom?: boolean;
  smallPaddingBottom?: boolean;
  scrollKey?: string;
  disableScrollRecovery?: boolean;
  onScrollEnd?: () => void;
}

export const Page = observer((props: PageProps) => {
  const {
    className,
    children,
    noPaddingBottom,
    smallPaddingBottom,
    scrollKey,
    disableScrollRecovery,
    onScrollEnd,
  } = props;
  const { isDesktop } = useViewport();
  const { scrollRecoveryStore } = useStore();
  const { pathname } = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const finalScrollKey = scrollKey || pathname;

  useInitialEffect(() => {
    if (wrapperRef.current && !disableScrollRecovery) {
      wrapperRef.current.scrollTop =
        scrollRecoveryStore.getScroll(finalScrollKey);
    }
  });

  const onScroll = useThrottle((e: UIEvent<HTMLDivElement>) => {
    if (!disableScrollRecovery) {
      scrollRecoveryStore.setScrollPosition(
        finalScrollKey,
        e.currentTarget.scrollTop,
      );
    }

    if (onScrollEnd) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (Math.abs(scrollHeight - scrollTop - clientHeight) < 50) {
        onScrollEnd();
      }
    }
  }, 100);

  const needsSpacer = !isDesktop;

  return (
    <main
      ref={wrapperRef}
      onScroll={onScroll}
      className={classNames(
        s.Page,
        {
          [s.desktop]: isDesktop,
          [s.withNavbar]: needsSpacer,
          [s.defaultPaddingBottom]: !noPaddingBottom && !smallPaddingBottom,
          [s.smallPaddingBottom]: smallPaddingBottom,
        },
        [className],
      )}
    >
      {needsSpacer && <div className={s.spacer} />}
      {children}
    </main>
  );
});
