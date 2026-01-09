import { Box } from '@mantine/core';
import { ReactNode, useState } from 'react';
import classes from './ProfileTabsSwitcher.module.scss';

export type ProfileTab = 'publications' | 'info' | 'interactions';

interface ProfileTabsSwitcherProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  children?: ReactNode;
}

const TABS: { label: string; value: ProfileTab }[] = [
  { label: 'Публикации', value: 'publications' },
  { label: 'Информация', value: 'info' },
  { label: 'Взаимодействия', value: 'interactions' },
];

export const ProfileTabsSwitcher = ({
  activeTab,
  onTabChange,
  children,
}: ProfileTabsSwitcherProps) => {
  const [internalTab, setInternalTab] = useState<ProfileTab>('publications');
  const tab = activeTab || internalTab;

  const handleTabChange = (newTab: ProfileTab) => {
    setInternalTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <Box className={classes.container}>
      <div className={classes.tabsWrapper}>
        <div className={classes.tabsList}>
          {TABS.map((tabItem) => (
            <button
              key={tabItem.value}
              type="button"
              className={`${classes.tab} ${tab === tabItem.value ? classes.tabActive : ''}`}
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
