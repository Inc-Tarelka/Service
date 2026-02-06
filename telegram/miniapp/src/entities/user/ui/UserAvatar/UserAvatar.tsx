import { Avatar } from '@mantine/core';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';

interface UserAvatarProps {
  src?: string;
  size?: number | string;
  className?: string;
}

export const UserAvatar = ({ src, size = 100, className }: UserAvatarProps) => {
  return (
    <Avatar
      src={src || defaultUserSvg}
      size={size}
      radius="100%"
      className={className}
    />
  );
};
