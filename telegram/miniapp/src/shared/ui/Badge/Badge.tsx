import { ReactNode } from 'react';
import { classNames } from 'shared/library/ClassNames/classNames';
import s from './Badge.module.scss';

interface BadgeProps {
  className?: string;
  children: ReactNode;
  count?: string | number;
}

export const Badge = (props: BadgeProps) => {
  const { className, children, count } = props;

  return (
    <div className={classNames(s.badge, {}, [className])}>
      <span className={s.label}>{children}</span>
      {count !== undefined && (
        <div className={s.countBox}>
          <span className={s.count}>{count}</span>
        </div>
      )}
    </div>
  );
};
