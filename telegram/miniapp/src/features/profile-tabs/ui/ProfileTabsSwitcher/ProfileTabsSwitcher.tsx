import { Box, SegmentedControl } from '@mantine/core';
import { ReactNode, useState } from 'react';
import classes from './ProfileTabsSwitcher.module.scss';

export type ProfileTab = 'publications' | 'info' | 'interactions';

interface ProfileTabsSwitcherProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  children?: ReactNode;
}

export const ProfileTabsSwitcher = ({
  activeTab,
  onTabChange,
  children,
}: ProfileTabsSwitcherProps) => {
  const [internalTab, setInternalTab] = useState<ProfileTab>('publications');
  const tab = activeTab || internalTab;

  const handleTabChange = (val: string) => {
    const newTab = val as ProfileTab;
    setInternalTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <Box className={`${classes.container} ${classes.stickyHeader}`}>
      <SegmentedControl
        fullWidth
        value={tab}
        onChange={handleTabChange}
        data={[
          { label: 'Публикации', value: 'publications' },
          { label: 'Информация', value: 'info' },
          { label: 'Взаимодействия', value: 'interactions' },
        ]}
        classNames={{
          root: classes.control,
          indicator: classes.indicator,
          label: classes.label,
        }}
      />
      <Box mt="md">{children}</Box>
    </Box>
  );
};
