import { Skeleton } from '@mantine/core';
import s from './ServiceListingDetailsSkeleton.module.scss';

export const ServiceListingDetailsSkeleton = () => {
  return (
    <div className={s.container}>
      <div className={s.imageSection}>
        <Skeleton height={300} radius={0} width="100%" />
      </div>

      <div className={s.infoSection}>
        <div className={s.badgesContainer}>
          <div className={s.badgesLeft}>
            <Skeleton height={36} radius={32} width={64} />
            <Skeleton height={36} radius={32} width={64} />
            <Skeleton height={36} radius={32} width={64} />
          </div>
          <div className={s.badgesRight}>
            <Skeleton height={36} radius="xl" width={36} />
            <Skeleton height={36} radius="xl" width={36} />
          </div>
        </div>

        <div className={s.topRow}>
          <Skeleton height={20} radius="sm" width={100} />
          <Skeleton height={20} radius="sm" width={40} />
        </div>

        <div className={s.textSection}>
          <Skeleton height={28} mb={8} radius="sm" width="80%" />
          <Skeleton height={20} mb={4} radius="sm" width="100%" />
          <Skeleton height={20} mb={4} radius="sm" width="90%" />
          <Skeleton height={20} radius="sm" width="60%" />
        </div>

        <div className={s.detailsList}>
          <div className={s.detailRow}>
            <Skeleton height={20} radius="sm" width={60} />
            <Skeleton height={20} radius="sm" width={120} />
          </div>
          <div className={s.detailRowTags}>
            <Skeleton height={20} radius="sm" width={60} />
            <div className={s.tagsList}>
              <Skeleton height={20} radius="sm" width={50} />
              <Skeleton height={20} radius="sm" width={80} />
              <Skeleton height={20} radius="sm" width={60} />
            </div>
          </div>
        </div>

        <div className={s.section}>
          <Skeleton height={24} mb={12} radius="sm" width={140} />
          <div className={s.teamList}>
            <Skeleton height={48} radius="md" width="100%" />
            <Skeleton height={48} radius="md" width="100%" />
          </div>
        </div>

        <div className={s.section}>
          <Skeleton height={24} mb={12} radius="sm" width={100} />
          <div className={s.needsList}>
            <Skeleton height={60} radius="md" width="100%" />
            <Skeleton height={60} radius="md" width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
};
