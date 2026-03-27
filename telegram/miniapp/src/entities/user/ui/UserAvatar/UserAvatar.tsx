import { Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import { Skeleton } from 'shared/ui/Skeleton';
import s from './UserAvatar.module.scss';

interface UserAvatarProps {
  src?: string;
  size?: number | string;
  className?: string;
}

export const UserAvatar = ({ src, size = 100, className }: UserAvatarProps) => {
  const [isLoading, setIsLoading] = useState(!!src);

  useEffect(() => {
    setIsLoading(!!src);
  }, [src]);

  return (
    <div
      className={`${s.wrapper} ${className || ''}`}
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <Skeleton
          variant="circular"
          width="100%"
          height="100%"
          className={s.skeletonOverlay}
        />
      )}
      <Avatar
        src={src || defaultUserSvg}
        size={size}
        radius="100%"
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.2s' }}
        imageProps={{
          onLoad: () => setIsLoading(false),
          onError: () => setIsLoading(false),
        }}
      />
    </div>
  );
};
