import { ActionIcon } from '@mantine/core';
import SettingsIcon from 'shared/assets/icons/settings';

interface EditProfileButtonProps {
  onClick?: () => void;
}

export const EditProfileButton = ({ onClick }: EditProfileButtonProps) => {
  return (
    <ActionIcon variant="transparent" color="gray" onClick={onClick}>
      <SettingsIcon />
    </ActionIcon>
  );
};
