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
  const [resolvedSrc, setResolvedSrc] = useState(src || defaultUserSvg);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  useEffect(() => {
    if (!src) {
      setResolvedSrc(defaultUserSvg);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    const img = new Image();
    const fallbackTimer = setTimeout(() => {
      if (isCancelled) return;
      setResolvedSrc(defaultUserSvg);
      setIsLoading(false);
    }, 8000);

    img.onload = () => {
      if (isCancelled) return;
      clearTimeout(fallbackTimer);
      setResolvedSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      if (isCancelled) return;
      clearTimeout(fallbackTimer);
      setResolvedSrc(defaultUserSvg);
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
    };
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
        src={resolvedSrc}
        size={size}
        radius="100%"
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.2s' }}
        imageProps={{
          onLoad: () => setIsLoading(false),
          onError: () => {
            setResolvedSrc(defaultUserSvg);
            setIsLoading(false);
          },
        }}
      />
    </div>
  );
};
