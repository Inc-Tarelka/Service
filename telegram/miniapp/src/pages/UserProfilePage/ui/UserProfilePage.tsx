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
import { deletePublication } from 'shared/api/service/Publication/api';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackToSearch } from 'shared/hooks/useBackToSearch';
import { buildUserStartAppLink } from 'shared/lib/utils/telegram-startapp';
import { SimpleTabsSwitcher } from 'shared/ui/TabsSwitcher';
import { ErrorPage } from 'widgets/ErrorPage/ui/ErrorPage';
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

  const handleTeammatesClick = () => {
    if (!id) return;
    navigate(
      `${RoutePath[AppRoutes.COLLABORATORS]}?tab=collaborators&userId=${id}`,
    );
  };

  const handleDeletePublication = async (pubId: number) => {
    await deletePublication(pubId);
    if (id) {
      userProfileStore.getUserExtendedProfileAction(id);
    }
  };

  const handleShareProfile = () => {
    if (!id) return;

    const shareLink = buildUserStartAppLink(id);
    const shareText = 'Смотри профиль в Tarelka';

    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareLink,
    )}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
      return;
    }

    window.open(telegramShareUrl, '_blank');
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
    return <ErrorPage />;
  }

  return (
    <Page className={classes.profilePage}>
      <ProfileBanner
        user={user}
        isOwnProfile={false}
        onShare={handleShareProfile}
        onTeammatesClick={handleTeammatesClick}
      />

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
              onDelete={handleDeletePublication}
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
