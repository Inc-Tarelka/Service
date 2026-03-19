import { ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from 'shared/assets/icons/settings';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import s from './EditProfileButton.module.scss';

export const EditProfileButton = () => {
  const navigate = useNavigate();

  const handleNavigateToSettings = () => {
    navigate(RoutePath.settings);
  };

  return (
    <ActionIcon
      variant="transparent"
      color="gray"
      onClick={handleNavigateToSettings}
      className={s.button}
    >
      <SettingsIcon />
    </ActionIcon>
  );
};
