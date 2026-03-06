import { Box, Stack } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { PublicationsList } from 'entities/publication';
import {
  OfferCollaborationButton,
  OfferCollaborationDrawer,
} from 'features/offer-collaboration';
import { PROFILE_TABS, ProfileTab } from 'features/profile-tabs';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBackToSearch } from 'shared/hooks/useBackToSearch';
import { Skeleton } from 'shared/ui/Skeleton';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher';
import { Page } from 'widgets/Page';
import { ProfileBanner } from 'widgets/profile-banner';
import { ProfileInfoSection } from 'widgets/profile-info';
import classes from './UserProfilePage.module.scss';

const UserProfilePageSkeleton = () => {
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

export const UserProfilePage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ProfileTab>('publications');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { userProfileStore, userStore } = useStore();

  useBackToSearch();

  useEffect(() => {
    if (id) {
      userProfileStore.getUserProfileAction(id);
    }
  }, [id, userProfileStore]);

  if (userProfileStore.isLoading) {
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
        <TabsSwitcher
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
            <PublicationsList publications={userStore.publications} />
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
