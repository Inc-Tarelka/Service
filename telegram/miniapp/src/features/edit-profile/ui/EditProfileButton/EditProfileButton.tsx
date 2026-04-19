import { ActionIcon, Group } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InviteFriendDrawer } from 'features/invite-friend';
import { PersonAdd } from 'shared/assets/icons/PersonAdd';
import SettingsIcon from 'shared/assets/icons/settings';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import s from './EditProfileButton.module.scss';

export const EditProfileButton = () => {
  const navigate = useNavigate();
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);

  const handleNavigateToSettings = () => {
    navigate(RoutePath.settings);
  };

  const handleOpenInviteDrawer = () => {
    setIsInviteDrawerOpen(true);
  };

  return (
    <>
      <Group gap={8}>
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={handleNavigateToSettings}
          className={s.button}
        >
          <SettingsIcon />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={handleOpenInviteDrawer}
          className={s.button}
        >
          <PersonAdd />
        </ActionIcon>
      </Group>

      <InviteFriendDrawer
        opened={isInviteDrawerOpen}
        onClose={() => setIsInviteDrawerOpen(false)}
      />
    </>
  );
};
