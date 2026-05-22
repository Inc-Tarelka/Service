import { ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from 'shared/assets/icons/settings';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import s from './EditProfileButton.module.scss';

export const EditProfileButton = () => {
  const navigate = useNavigate();

  return (
    <ActionIcon
      variant="transparent"
      color="gray"
      onClick={() => navigate(RoutePath.settings)}
      className={s.button}
    >
      <SettingsIcon />
    </ActionIcon>
  );
};
