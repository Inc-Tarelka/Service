import { Box } from '@mantine/core';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { EditProfileButton } from 'features/edit-profile';
import { ProfileTab, ProfileTabsSwitcher } from 'features/profile-tabs';
import { useState } from 'react';
import {
  MOCK_INTERACTIONS,
  MOCK_PUBLICATIONS,
  MOCK_USER,
} from 'shared/mocks/profileMocks';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';

export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const user = MOCK_USER;

  return (
    <Page withNavbar={true}>
      <ProfileBanner user={user} isOwnProfile={true} />

      <Box px="md" mt="md">
        <EditProfileButton />
      </Box>

      <ProfileTabsSwitcher activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'publications' && (
          <PublicationsList publications={MOCK_PUBLICATIONS} />
        )}
        {activeTab === 'info' && <ProfileInfoSection user={user} />}
        {activeTab === 'interactions' && (
          <InteractionsList interactions={MOCK_INTERACTIONS} canEdit={true} />
        )}
      </ProfileTabsSwitcher>
    </Page>
  );
};

export default ProfilePage;
