import { Skeleton } from '@mantine/core';

export const NeedDetailsDrawerSkeleton = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingTop: 16,
      }}
    >
      <Skeleton height={28} width="70%" radius="md" />
      <Skeleton height={80} radius="md" />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <Skeleton height={20} width="20%" radius="md" />
        <Skeleton height={20} width="40%" radius="md" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height={20} width="20%" radius="md" />
        <Skeleton height={20} width="30%" radius="md" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height={20} width="20%" radius="md" />
        <Skeleton height={20} width="25%" radius="md" />
      </div>
    </div>
  );
};
