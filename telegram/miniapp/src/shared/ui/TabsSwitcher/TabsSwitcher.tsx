import { Box } from '@mantine/core';
import clsx from 'clsx';
import { ReactNode, useRef, useState } from 'react';
import classes from './TabsSwitcher.module.scss';

export interface TabItem<T extends string> {
  label: string;
  value: T;
}

interface TabsSwitcherProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;
  children?: ReactNode;
  className?: string;
}

export const TabsSwitcher = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: TabsSwitcherProps<T>) => {
  const [internalTab, setInternalTab] = useState<T>(tabs[0]?.value);
  const currentTab = activeTab !== undefined ? activeTab : internalTab;
  const tabsWrapperRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (
    newTab: T,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (activeTab === undefined) {
      setInternalTab(newTab);
    }
    onTabChange?.(newTab);

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
  };

  return (
    <Box className={clsx(classes.container, className)}>
      <div className={classes.tabsWrapper} ref={tabsWrapperRef}>
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
            </button>
          ))}
        </div>
      </div>
      <Box className={classes.content}>{children}</Box>
    </Box>
  );
};
