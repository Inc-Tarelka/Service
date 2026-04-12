import { Box } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackToSearch } from 'shared/hooks/useBackToSearch';
import { SimpleTabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './ProfilePage.module.scss';
import { ProfilePageSkeleton } from './ProfilePage.skeleton';

export const ProfilePage = observer(() => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const { userStore } = useStore();
  const navigate = useNavigate();

  useBackToSearch();

  const handlePublicationClick = (id: number) => {
    navigate(RoutePath[AppRoutes.SERVICE_DETAIL].replace(':id', String(id)));
  };

  useEffect(() => {
    userStore.getMyExtendedProfileAction();
  }, [userStore]);

  if (userStore.isLoadingProfile) {
    return <ProfilePageSkeleton />;
  }

  const user = userStore.profile;

  if (!user) {
    return <div>Ошибка загрузки профиля</div>;
  }

  return (
    <Page className={classes.profilePage} disableScrollRecovery>
      <ProfileBanner
        user={user}
        isOwnProfile={true}
        coverImage={user.wallpaper_url}
      />

      <Box className={classes.tabsSection}>
        <SimpleTabsSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={PROFILE_TABS}
          contentPaddingTop={16}
        >
          {activeTab === 'publications' && (
            <PublicationsList
              publications={userStore.publications}
              onItemClick={handlePublicationClick}
            />
          )}
          {activeTab === 'info' && <ProfileInfoSection user={user} />}
          {activeTab === 'interactions' && (
            <InteractionsList interactions={userStore.interactions} canEdit />
          )}
        </SimpleTabsSwitcher>
      </Box>
    </Page>
  );
});

export default ProfilePage;
