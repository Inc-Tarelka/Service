import { Box } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { PublicationsList } from 'entities/publication';
import {
  OfferCollaborationButton,
  OfferCollaborationDrawer,
} from 'features/offer-collaboration';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackToSearch } from 'shared/hooks/useBackToSearch';
import { SimpleTabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './UserProfilePage.module.scss';
import { UserProfilePageSkeleton } from './UserProfilePage.skeleton';

export const UserProfilePage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { userProfileStore } = useStore();
  const navigate = useNavigate();

  const handlePublicationClick = (pubId: number) => {
    navigate(RoutePath[AppRoutes.SERVICE_DETAIL].replace(':id', String(pubId)));
  };

  useBackToSearch();

  useEffect(() => {
    if (id) {
      userProfileStore.getUserExtendedProfileAction(id);
    }
  }, [id, userProfileStore]);

  if (userProfileStore.isExtendedLoading || userProfileStore.isLoading) {
    return <UserProfilePageSkeleton />;
  }

  const user = userProfileStore.profile;

  if (!user) {
    return (
      <Page className={classes.profilePage}>
        <div>Ошибка загрузки профиля пользователя</div>
      </Page>
    );
  }

  return (
    <Page className={classes.profilePage}>
      <ProfileBanner user={user} isOwnProfile={false} />

      <Box className={classes.buttonWrapper}>
        <OfferCollaborationButton onClick={() => setIsDrawerOpen(true)} />
      </Box>

      <Box className={classes.tabsSection}>
        <SimpleTabsSwitcher
          contentPaddingTop={16}
          fullWidth={true}
          hideMask={true}
          className={classes.tabsSwitcher}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={PROFILE_TABS.filter((t) =>
            (['publications', 'info'] as ProfileTab[]).includes(t.value),
          )}
        >
          {activeTab === 'publications' && (
            <PublicationsList
              publications={
                userProfileStore.extendedProfile?.publications || []
              }
              onItemClick={handlePublicationClick}
            />
          )}
          {activeTab === 'info' && (
            <ProfileInfoSection
              user={user}
              sender={userProfileStore.extendedProfile?.sender}
              isPublicView={true}
            />
          )}
        </SimpleTabsSwitcher>
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
