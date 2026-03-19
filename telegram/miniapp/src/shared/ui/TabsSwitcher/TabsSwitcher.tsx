import { Box } from '@mantine/core';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useCallback, useRef, useState } from 'react';
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
  className?: string;
  fullWidth?: boolean;
  hideMask?: boolean;
  contentPaddingTop?: number | string;
}

const SWIPE_THRESHOLD = 50;
const DIRECTION_LOCK_THRESHOLD = 10;

interface TouchState {
  startX: number;
  startY: number;
  direction: 'horizontal' | 'vertical' | null;
}

const contentVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '30%' : '-30%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-30%' : '30%',
    opacity: 0,
  }),
};

export const TabsSwitcher = <T extends string>(props: TabsSwitcherProps<T>) => {
  const {
    tabs,
    activeTab,
    onTabChange,
    children,
    className,
    fullWidth,
    hideMask,
    contentPaddingTop,
  } = props;
  const [internalTab, setInternalTab] = useState<T>(tabs[0]?.value);
  const currentTab = activeTab !== undefined ? activeTab : internalTab;
  const tabsWrapperRef = useRef<HTMLDivElement>(null);

  const currentIndex = tabs.findIndex((t) => t.value === currentTab);

  const touchRef = useRef<TouchState | null>(null);
  const offsetRef = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);

  const changeTab = useCallback(
    (newTab: T, direction: number) => {
      setSlideDirection(direction);
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
    const newIndex = tabs.findIndex((t) => t.value === newTab);
    changeTab(newTab, newIndex > currentIndex ? 1 : -1);

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
        changeTab(tabs[newIndex].value, current < 0 ? 1 : -1);
      }
    }

    offsetRef.current = 0;
    setOffsetX(0);
    setIsSwiping(false);
  }, [currentIndex, tabs, changeTab]);

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
      <Box
        className={classes.content}
        pt={contentPaddingTop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isSwiping ? `translateX(${offsetX}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={slideDirection}
        >
          <motion.div
            key={currentTab}
            custom={slideDirection}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};
