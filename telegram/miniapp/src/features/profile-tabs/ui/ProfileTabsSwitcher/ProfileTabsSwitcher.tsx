import { Box } from '@mantine/core';
import { ReactNode, useState } from 'react';
import classes from './ProfileTabsSwitcher.module.scss';

export type ProfileTab = 'publications' | 'info' | 'interactions';

interface ProfileTabsSwitcherProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  children?: ReactNode;
  allowedTabs?: ProfileTab[];
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
  allowedTabs,
}: ProfileTabsSwitcherProps) => {
  const [internalTab, setInternalTab] = useState<ProfileTab>('publications');
  const tab = activeTab || internalTab;

  const filteredTabs = allowedTabs
    ? TABS.filter((t) => allowedTabs.includes(t.value))
    : TABS;

  const handleTabChange = (newTab: ProfileTab) => {
    setInternalTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <Box className={classes.container}>
      <div className={classes.tabsWrapper}>
        <div className={classes.tabsList}>
          {filteredTabs.map((tabItem) => (
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
