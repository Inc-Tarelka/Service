import { Box } from '@mantine/core';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { OfferCollaborationButton } from 'features/offer-collaboration';
import { ProfileTab, ProfileTabsSwitcher } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  MOCK_INTERACTIONS,
  MOCK_OTHER_USER,
  MOCK_PUBLICATIONS,
} from 'shared/mocks/profileMocks';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';

export const UserProfilePage = observer(() => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const user = MOCK_OTHER_USER;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'publications':
        return <PublicationsList publications={MOCK_PUBLICATIONS} />;
      case 'info':
        return <ProfileInfoSection user={user} isPublicView={true} />;
      case 'interactions':
        return (
          <InteractionsList interactions={MOCK_INTERACTIONS} canEdit={false} />
        );
      default:
        return null;
    }
  };

  return (
    <Page>
      <ProfileBanner user={user} isOwnProfile={false} />

      <Box px="md" mt="md">
        <OfferCollaborationButton userId={user.id} />
      </Box>

      <ProfileTabsSwitcher activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </ProfileTabsSwitcher>
    </Page>
  );
});
