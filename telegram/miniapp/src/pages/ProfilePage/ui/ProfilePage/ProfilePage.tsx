import { Box } from '@mantine/core';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { useState } from 'react';
import {
  MOCK_INTERACTIONS,
  MOCK_PUBLICATIONS,
  MOCK_USER,
} from 'shared/mocks/profileMocks';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './ProfilePage.module.scss';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const user = MOCK_USER;

  return (
    <Page className={classes.profilePage}>
      <ProfileBanner user={user} isOwnProfile={true} />

      <Box className={classes.tabsSection}>
        <TabsSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={PROFILE_TABS}
        >
          {activeTab === 'publications' && (
            <PublicationsList publications={MOCK_PUBLICATIONS} />
          )}
          {activeTab === 'info' && <ProfileInfoSection user={user} />}
          {activeTab === 'interactions' && (
            <InteractionsList interactions={MOCK_INTERACTIONS} canEdit={true} />
          )}
        </TabsSwitcher>
      </Box>
    </Page>
  );
};

export default ProfilePage;
