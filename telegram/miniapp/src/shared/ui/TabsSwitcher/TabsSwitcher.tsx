import { Box } from '@mantine/core';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';
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

  const handleTabChange = (newTab: T) => {
    if (activeTab === undefined) {
      setInternalTab(newTab);
    }
    onTabChange?.(newTab);
  };

  return (
    <Box className={clsx(classes.container, className)}>
      <div className={classes.tabsWrapper}>
        <div className={classes.tabsList}>
          {tabs.map((tabItem) => (
            <button
              key={tabItem.value}
              type="button"
              className={clsx(classes.tab, {
                [classes.tabActive]: currentTab === tabItem.value,
              })}
              onClick={() => handleTabChange(tabItem.value)}
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
