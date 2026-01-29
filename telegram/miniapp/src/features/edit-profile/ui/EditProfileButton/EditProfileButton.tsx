import { ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from 'shared/assets/icons/settings';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

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
    >
      <SettingsIcon />
    </ActionIcon>
  );
};
