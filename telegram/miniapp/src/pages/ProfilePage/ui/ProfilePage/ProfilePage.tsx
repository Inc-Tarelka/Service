import { Box, Stack } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { InteractionsList } from 'entities/interaction';
import { PublicationsList } from 'entities/publication';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Skeleton } from 'shared/ui/Skeleton';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './ProfilePage.module.scss';

const ProfilePageSkeleton = () => {
  return (
    <Page className={classes.profilePage}>
      <Box>
        <Skeleton height={200} borderRadius={0} />
        <Stack align="center" mt={-50} gap="sm" p="md">
          <Skeleton variant="circular" width={100} height={100} />
          <Skeleton width={180} height={20} />
          <Skeleton width={120} height={14} />
        </Stack>
      </Box>
    </Page>
  );
};

export const ProfilePage = observer(() => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const { userStore } = useStore();
  const [minLoadTime, setMinLoadTime] = useState(true);

  useEffect(() => {
    userStore.getProfileAction();

    // Minimum skeleton display time
    const timer = setTimeout(() => {
      setMinLoadTime(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [userStore]);

  if (userStore.isLoadingProfile || minLoadTime) {
    return <ProfilePageSkeleton />;
  }

  const user = userStore.profile;

  if (!user) {
    return <div>Ошибка загрузки профиля</div>;
  }

  return (
    <Page className={classes.profilePage}>
      <ProfileBanner
        user={user}
        isOwnProfile={true}
        coverImage={user.wallpaper_url}
      />

      <Box className={classes.tabsSection}>
        <TabsSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={PROFILE_TABS}
        >
          {activeTab === 'publications' && (
            <PublicationsList publications={userStore.publications} />
          )}
          {activeTab === 'info' && <ProfileInfoSection user={user} />}
          {activeTab === 'interactions' && (
            <InteractionsList
              interactions={userStore.interactions}
              canEdit={true}
            />
          )}
        </TabsSwitcher>
      </Box>
    </Page>
  );
});

export default ProfilePage;
