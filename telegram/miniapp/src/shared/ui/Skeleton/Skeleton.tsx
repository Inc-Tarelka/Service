import { CSSProperties } from 'react';
import classes from './Skeleton.module.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius,
  className,
  variant = 'rectangular',
}: SkeletonProps) => {
  const style: CSSProperties = {
    width,
    height,
    borderRadius:
      borderRadius ??
      (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px'),
  };

  return (
    <div
      className={`${classes.skeleton} ${className || ''}`}
      style={style}
      aria-hidden="true"
    />
  );
};
