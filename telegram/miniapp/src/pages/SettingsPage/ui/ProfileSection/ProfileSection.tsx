import { Button, Group } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { ActionItem, ActionsDrawer } from 'entities/interaction';
import { EditProfileForm } from 'features/edit-profile';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import EditIcon from 'shared/assets/icons/edit';
import GalleryIcon from 'shared/assets/icons/gallery';
import TrashIcon from 'shared/assets/icons/trash';
import { ProfileBanner } from 'widgets/profile-banner';
import s from './ProfileSection.module.scss';

export const ProfileSection = observer(() => {
  const { userStore } = useStore();
  const [avatarDrawerOpened, setAvatarDrawerOpened] = useState(false);
  const [coverDrawerOpened, setCoverDrawerOpened] = useState(false);

  useEffect(() => {
    if (!userStore.profile && !userStore.isLoadingProfile) {
      userStore.getProfileAction();
    }
  }, [userStore]);

  const user = userStore.profile;

  const handleAvatarAction = (action: 'gallery' | 'delete') => {
    console.log('Avatar action:', action);
    // TODO: Implement actual logic
  };

  const handleCoverAction = (action: 'gallery' | 'delete') => {
    console.log('Cover action:', action);
    // TODO: Implement actual logic
  };

  const avatarActions: ActionItem[] = [
    {
      label: 'Выбрать из галереи',
      icon: <GalleryIcon />,
      onClick: () => handleAvatarAction('gallery'),
    },
    {
      label: 'Удалить текущее фото',
      icon: <TrashIcon color="var(--red)" />,
      variant: 'danger',
      onClick: () => handleAvatarAction('delete'),
    },
  ];

  const coverActions: ActionItem[] = [
    {
      label: 'Выбрать из галереи',
      icon: <GalleryIcon />,
      onClick: () => handleCoverAction('gallery'),
    },
    {
      label: 'Удалить текущее фото',
      icon: <TrashIcon color="var(--red)" />,
      variant: 'danger',
      onClick: () => handleCoverAction('delete'),
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
            onClick={() => setAvatarDrawerOpened(true)}
            color="var(--text-color)"
          >
            Аватарка
          </Button>
          <Button
            variant="outline"
            radius="xl"
            size="md"
            leftSection={<EditIcon className={s.icon} />}
            onClick={() => setCoverDrawerOpened(true)}
            color="var(--text-color)"
          >
            Обложка
          </Button>
        </Group>

        <EditProfileForm />
      </div>

      <ActionsDrawer
        opened={avatarDrawerOpened}
        onClose={() => setAvatarDrawerOpened(false)}
        title="Аватарка"
        actions={avatarActions}
      />

      <ActionsDrawer
        opened={coverDrawerOpened}
        onClose={() => setCoverDrawerOpened(false)}
        title="Обложка"
        actions={coverActions}
      />
    </div>
  );
});
