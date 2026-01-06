import { Box } from '@mantine/core';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { OfferCollaborationButton } from 'features/offer-collaboration';
import { ProfileTab, ProfileTabsSwitcher } from 'features/profile-tabs';
import { useState } from 'react';
import {
  MOCK_INTERACTIONS,
  MOCK_OTHER_USER,
  MOCK_PUBLICATIONS,
} from 'shared/mocks/profileMocks';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';

export const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const user = MOCK_OTHER_USER;

  return (
    <Page withNavbar={false}>
      <ProfileBanner user={user} isOwnProfile={false} />

      <Box px="md" mt="md">
        <OfferCollaborationButton userId={user.id} />
      </Box>

      <ProfileTabsSwitcher activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'publications' && (
          <PublicationsList publications={MOCK_PUBLICATIONS} />
        )}
        {activeTab === 'info' && (
          <ProfileInfoSection user={user} isPublicView={true} />
        )}
        {activeTab === 'interactions' && (
          <InteractionsList interactions={MOCK_INTERACTIONS} canEdit={false} />
        )}
      </ProfileTabsSwitcher>
    </Page>
  );
};
