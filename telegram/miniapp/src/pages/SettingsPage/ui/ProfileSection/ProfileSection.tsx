import { Button, Group } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { ActionItem, ActionsDrawer } from 'entities/interaction';
import {
  AvatarUploadDrawer,
  CoverUploadDrawer,
  EditProfileForm,
} from 'features/edit-profile';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import EditIcon from 'shared/assets/icons/edit';
import GalleryIcon from 'shared/assets/icons/gallery';
import TrashIcon from 'shared/assets/icons/trash';
import { ProfileBanner } from 'widgets/profile-banner';
import s from './ProfileSection.module.scss';

export const ProfileSection = observer(() => {
  const { userStore } = useStore();

  const [avatarActionsOpened, setAvatarActionsOpened] = useState(false);
  const [coverActionsOpened, setCoverActionsOpened] = useState(false);
  const [avatarEditorOpened, setAvatarEditorOpened] = useState(false);
  const [coverEditorOpened, setCoverEditorOpened] = useState(false);
  const [avatarAutoOpen, setAvatarAutoOpen] = useState(false);
  const [coverAutoOpen, setCoverAutoOpen] = useState(false);

  useEffect(() => {
    if (!userStore.profile && !userStore.isLoadingProfile) {
      userStore.getProfileAction();
    }
  }, [userStore]);

  const user = userStore.profile;

  const handleDeleteAvatar = async () => {
    if (!user) return;
    await userStore.updateProfileAction({ logo_url: '' }, user.id as number);
    await userStore.getProfileAction();
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
      onClick: () => {
        setAvatarAutoOpen(true);
        setAvatarEditorOpened(true);
      },
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
      onClick: () => {
        setCoverAutoOpen(true);
        setCoverEditorOpened(true);
      },
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
            onClick={() => setAvatarActionsOpened(true)}
            color="var(--text-color)"
          >
            Аватарка
          </Button>
          <Button
            variant="outline"
            radius="xl"
            size="md"
            leftSection={<EditIcon className={s.icon} />}
            onClick={() => setCoverActionsOpened(true)}
            color="var(--text-color)"
          >
            Обложка
          </Button>
        </Group>

        <EditProfileForm />
      </div>

      <ActionsDrawer
        opened={avatarActionsOpened}
        onClose={() => setAvatarActionsOpened(false)}
        title="Аватарка"
        actions={avatarActions}
      />

      <ActionsDrawer
        opened={coverActionsOpened}
        onClose={() => setCoverActionsOpened(false)}
        title="Обложка"
        actions={coverActions}
      />

      {user && (
        <AvatarUploadDrawer
          opened={avatarEditorOpened}
          onClose={() => {
            setAvatarEditorOpened(false);
            setAvatarAutoOpen(false);
          }}
          userId={user.id as number}
          currentAvatarUrl={user.logo_url}
          autoOpenPicker={avatarAutoOpen}
        />
      )}

      {user && (
        <CoverUploadDrawer
          opened={coverEditorOpened}
          onClose={() => {
            setCoverEditorOpened(false);
            setCoverAutoOpen(false);
          }}
          userId={user.id as number}
          currentCoverUrl={user.wallpaper_url}
          autoOpenPicker={coverAutoOpen}
        />
      )}
    </div>
  );
});
