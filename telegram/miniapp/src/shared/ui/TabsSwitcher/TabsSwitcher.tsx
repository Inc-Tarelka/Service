import { Box } from '@mantine/core';
import clsx from 'clsx';
import React, {
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classes from './TabsSwitcher.module.scss';

export interface TabItem<T extends string> {
  label: string;
  value: T;
  badge?: string;
}

interface TabsSwitcherProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;
  children?: ReactNode;
  renderTab?: (tab: T) => ReactNode;
  className?: string;
  fullWidth?: boolean;
  hideMask?: boolean;
  contentPaddingTop?: number | string;
  stickyTop?: string | number;
}

const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK_THRESHOLD = 10;

interface TouchState {
  startX: number;
  startY: number;
  direction: 'horizontal' | 'vertical' | null;
}

export const TabsSwitcher = <T extends string>(props: TabsSwitcherProps<T>) => {
  const {
    tabs,
    activeTab,
    onTabChange,
    children,
    renderTab,
    className,
    fullWidth,
    hideMask,
    contentPaddingTop,
    stickyTop,
  } = props;
  const [internalTab, setInternalTab] = useState<T>(tabs[0]?.value);
  const currentTab = activeTab !== undefined ? activeTab : internalTab;
  const tabsWrapperRef = useRef<HTMLDivElement>(null);
  const [tabsBarHeight, setTabsBarHeight] = useState(40);

  const currentIndex = tabs.findIndex((t) => t.value === currentTab);

  const touchRef = useRef<TouchState | null>(null);
  const offsetRef = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const trackPageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activePageHeight, setActivePageHeight] = useState<
    number | undefined
  >();

  useLayoutEffect(() => {
    if (stickyTop === undefined) return;
    const el = tabsWrapperRef.current;
    if (!el) return;
    const update = () => setTabsBarHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stickyTop]);

  useLayoutEffect(() => {
    if (stickyTop !== undefined) return;
    const el = trackPageRefs.current.get(currentTab);
    if (!el) return;
    const update = () => setActivePageHeight(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentTab, stickyTop]);

  const changeTab = useCallback(
    (newTab: T) => {
      if (activeTab === undefined) {
        setInternalTab(newTab);
      }
      onTabChange?.(newTab);
    },
    [activeTab, onTabChange],
  );

  const handleTabChange = (
    newTab: T,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    changeTab(newTab);

    if (!fullWidth) {
      const buttonElement = event.currentTarget;
      const wrapperElement = tabsWrapperRef.current;

      if (buttonElement && wrapperElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const wrapperRect = wrapperElement.getBoundingClientRect();

        const isFullyVisible =
          buttonRect.left >= wrapperRect.left &&
          buttonRect.right <= wrapperRect.right;

        if (!isFullyVisible) {
          const scrollLeft =
            buttonElement.offsetLeft -
            wrapperElement.offsetLeft -
            (wrapperRect.width - buttonRect.width) / 2;

          wrapperElement.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }
      }
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      direction: null,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const state = touchRef.current;
      if (!state) return;

      const touch = e.touches[0];
      const dx = touch.clientX - state.startX;
      const dy = touch.clientY - state.startY;

      if (state.direction === null) {
        if (
          Math.abs(dx) < DIRECTION_LOCK_THRESHOLD &&
          Math.abs(dy) < DIRECTION_LOCK_THRESHOLD
        ) {
          return;
        }
        state.direction =
          Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }

      if (state.direction !== 'horizontal') {
        touchRef.current = null;
        offsetRef.current = 0;
        setOffsetX(0);
        setIsSwiping(false);
        return;
      }

      setIsSwiping(true);

      let finalDx = dx;
      if (
        (dx > 0 && currentIndex === 0) ||
        (dx < 0 && currentIndex === tabs.length - 1)
      ) {
        finalDx = dx * 0.2;
      }

      offsetRef.current = finalDx;
      setOffsetX(finalDx);
    },
    [currentIndex, tabs.length],
  );

  const handleTouchEnd = useCallback(() => {
    const state = touchRef.current;
    touchRef.current = null;

    if (!state || state.direction !== 'horizontal') {
      offsetRef.current = 0;
      setOffsetX(0);
      setIsSwiping(false);
      return;
    }

    const current = offsetRef.current;

    if (Math.abs(current) > SWIPE_THRESHOLD) {
      const newIndex =
        current < 0
          ? Math.min(currentIndex + 1, tabs.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (newIndex !== currentIndex) {
        changeTab(tabs[newIndex].value);
      }
    }

    offsetRef.current = 0;
    setOffsetX(0);
    setIsSwiping(false);
  }, [currentIndex, tabs, changeTab]);

  const stickyTopCss =
    stickyTop !== undefined
      ? typeof stickyTop === 'number'
        ? `${stickyTop}px`
        : String(stickyTop)
      : undefined;

  const independentScroll =
    stickyTopCss !== undefined && renderTab !== undefined;

  const viewportStyle: React.CSSProperties | undefined = independentScroll
    ? {
        height: `calc(100dvh - ${stickyTopCss} - ${tabsBarHeight}px - var(--TB-padding, 0px))`,
        overflow: 'hidden',
      }
    : undefined;

  return (
    <Box
      className={clsx(classes.container, className, {
        [classes.fullWidth]: fullWidth,
        [classes.noMask]: hideMask,
      })}
    >
      <div
        className={clsx(classes.tabsWrapper, { [classes.noMask]: hideMask })}
        ref={tabsWrapperRef}
        style={
          stickyTop !== undefined
            ? {
                position: 'sticky',
                top: stickyTop,
                backgroundColor: 'var(--bg-color)',
                zIndex: 50,
              }
            : undefined
        }
      >
        <div className={classes.tabsList}>
          {tabs.map((tabItem) => (
            <button
              key={tabItem.value}
              type="button"
              className={clsx(classes.tab, {
                [classes.tabActive]: currentTab === tabItem.value,
              })}
              onClick={(e) => handleTabChange(tabItem.value, e)}
            >
              {tabItem.label}
              {tabItem.badge && (
                <span className={classes.tabBadge}>{tabItem.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {renderTab ? (
        <Box
          className={classes.viewport}
          pt={independentScroll ? undefined : contentPaddingTop}
          style={
            viewportStyle ??
            (activePageHeight !== undefined
              ? { maxHeight: activePageHeight }
              : undefined)
          }
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={classes.track}
            style={{
              width: `${tabs.length * 100}%`,
              height: independentScroll ? '100%' : undefined,
              transform: `translateX(calc(-${currentIndex * (100 / tabs.length)}% + ${offsetX}px))`,
              transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.value}
                ref={(el) => {
                  if (el) trackPageRefs.current.set(tab.value, el);
                  else trackPageRefs.current.delete(tab.value);
                }}
                className={classes.trackPage}
                style={{
                  width: `${100 / tabs.length}%`,
                  ...(independentScroll
                    ? {
                        overflowY: 'auto',
                        height: '100%',
                        paddingTop: contentPaddingTop,
                      }
                    : {}),
                }}
              >
                {renderTab(tab.value)}
              </div>
            ))}
          </div>
        </Box>
      ) : (
        <Box className={classes.content} pt={contentPaddingTop}>
          {children}
        </Box>
      )}
    </Box>
  );
};
