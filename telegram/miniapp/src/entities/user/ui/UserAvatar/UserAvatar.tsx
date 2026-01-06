import { Avatar } from '@mantine/core';

interface UserAvatarProps {
  src?: string;
  size?: number | string;
  className?: string;
}

export const UserAvatar = ({ src, size = 100, className }: UserAvatarProps) => {
  return <Avatar src={src} size={size} radius="100%" className={className} />;
};
