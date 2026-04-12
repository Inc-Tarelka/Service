import { Box } from '@mantine/core';
import clsx from 'clsx';
import { type MouseEvent, type ReactNode, useRef, useState } from 'react';
import type { TabItem } from './TabsSwitcher';
import classes from './SimpleTabsSwitcher.module.scss';

interface SimpleTabsSwitcherProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  hideMask?: boolean;
  contentPaddingTop?: number | string;
}

export const SimpleTabsSwitcher = <T extends string>(
  props: SimpleTabsSwitcherProps<T>,
) => {
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

  const handleTabChange = (newTab: T, event: MouseEvent<HTMLButtonElement>) => {
    if (activeTab === undefined) {
      setInternalTab(newTab);
    }
    onTabChange?.(newTab);

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
      <Box className={classes.content} pt={contentPaddingTop}>
        {children}
      </Box>
    </Box>
  );
};
