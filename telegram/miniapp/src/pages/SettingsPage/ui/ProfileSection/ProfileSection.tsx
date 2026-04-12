import { Button, Group } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { ActionItem, ActionsDrawer } from 'entities/interaction';
import {
  AvatarUploadDrawer,
  CoverUploadDrawer,
  EditProfileForm,
} from 'features/edit-profile';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import EditIcon from 'shared/assets/icons/edit';
import GalleryIcon from 'shared/assets/icons/gallery';
import TrashIcon from 'shared/assets/icons/trash';
import { ProfileBanner } from 'widgets/profile-banner';
import s from './ProfileSection.module.scss';

export const ProfileSection = observer(() => {
  const { userStore, profileEditorStore } = useStore();

  useEffect(() => {
    if (!userStore.profile && !userStore.isLoadingProfile) {
      userStore.getProfileAction();
    }
    if (!userStore.myExtendedProfileData && !userStore.isLoadingProfile) {
      userStore.getMyExtendedProfileAction();
    }
  }, [userStore]);

  const user = userStore.profile;

  const handleDeleteAvatar = async () => {
    if (!user) return;
    await userStore.updateProfileAction({ logo_url: '' }, user.id as number);
    userStore.setLocalOverride({ avatarUrl: '', logo_url: '' });
  };

  const handleDeleteCover = async () => {
    if (!user) return;
    await userStore.updateProfileAction(
      { wallpaper_url: '' },
      user.id as number,
    );
    await userStore.getProfileAction();
  };

  const avatarActions: ActionItem[] = [
    {
      label: 'Выбрать из галереи',
      icon: <GalleryIcon />,
      onClick: () => profileEditorStore.openAvatarEditor(true),
    },
    {
      label: 'Удалить текущее фото',
      icon: <TrashIcon color="var(--red)" />,
      variant: 'danger',
      onClick: handleDeleteAvatar,
    },
  ];

  const coverActions: ActionItem[] = [
    {
      label: 'Выбрать из галереи',
      icon: <GalleryIcon />,
      onClick: () => profileEditorStore.openCoverEditor(true),
    },
    {
      label: 'Удалить текущее фото',
      icon: <TrashIcon color="var(--red)" />,
      variant: 'danger',
      onClick: handleDeleteCover,
    },
  ];

  return (
    <div className={s.section}>
      <div className={s.header}>
        <h2 className={s.title}>Аккаунт и профиль</h2>
      </div>

      {user && (
        <ProfileBanner
          user={user}
          isOwnProfile={true}
          coverImage={user.wallpaper_url}
          minimal
        />
      )}

      <div className={s.paddedContent}>
        <Group grow>
          <Button
            variant="outline"
            radius="xl"
            size="md"
            leftSection={<EditIcon className={s.icon} />}
            onClick={profileEditorStore.openAvatarActions}
            color="var(--text-color)"
          >
            Аватарка
          </Button>
          <Button
            variant="outline"
            radius="xl"
            size="md"
            leftSection={<EditIcon className={s.icon} />}
            onClick={profileEditorStore.openCoverActions}
            color="var(--text-color)"
          >
            Обложка
          </Button>
        </Group>

        <EditProfileForm />
      </div>

      <ActionsDrawer
        opened={profileEditorStore.avatarActionsOpened}
        onClose={profileEditorStore.closeAvatarActions}
        title="Аватарка"
        actions={avatarActions}
      />

      <ActionsDrawer
        opened={profileEditorStore.coverActionsOpened}
        onClose={profileEditorStore.closeCoverActions}
        title="Обложка"
        actions={coverActions}
      />

      {user && (
        <AvatarUploadDrawer
          opened={profileEditorStore.avatarEditorOpened}
          onClose={profileEditorStore.closeAvatarEditor}
          userId={user.id as number}
          currentAvatarUrl={user.logo_url}
          autoOpenPicker={profileEditorStore.avatarAutoOpen}
        />
      )}

      {user && (
        <CoverUploadDrawer
          opened={profileEditorStore.coverEditorOpened}
          onClose={profileEditorStore.closeCoverEditor}
          userId={user.id as number}
          currentCoverUrl={user.wallpaper_url}
          autoOpenPicker={profileEditorStore.coverAutoOpen}
        />
      )}
    </div>
  );
});
