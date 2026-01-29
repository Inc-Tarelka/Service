import { Box } from '@mantine/core';
import { PublicationsList } from 'entities/publication';
import {
  OfferCollaborationButton,
  OfferCollaborationDrawer,
} from 'features/offer-collaboration';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { MOCK_OTHER_USER, MOCK_PUBLICATIONS } from 'shared/mocks/profileMocks';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './UserProfilePage.module.scss';

export const UserProfilePage = observer(() => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const user = MOCK_OTHER_USER;

  return (
    <Page className={classes.profilePage}>
      <ProfileBanner user={user} isOwnProfile={false} />

      <Box className={classes.buttonWrapper}>
        <OfferCollaborationButton onClick={() => setIsDrawerOpen(true)} />
      </Box>

      <Box className={classes.tabsSection}>
        <TabsSwitcher
          className={classes.tabsSwitcher}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={PROFILE_TABS.filter((t) =>
            (['publications', 'info'] as ProfileTab[]).includes(t.value),
          )}
        >
          {activeTab === 'publications' && (
            <PublicationsList publications={MOCK_PUBLICATIONS} />
          )}
          {activeTab === 'info' && (
            <ProfileInfoSection user={user} isPublicView={true} />
          )}
        </TabsSwitcher>
      </Box>

      <OfferCollaborationDrawer
        userId={String(user.id)}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Page>
  );
});

export default UserProfilePage;
