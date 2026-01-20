import { Skeleton } from '@mantine/core';

export const SpecializationsListSkeleton = () => {
  return (
    <div>
      <Skeleton height={40} width="100%" mb={8} radius="xl" />
      <Skeleton height={40} width="100%" mb={8} radius="xl" />
      <Skeleton height={40} width="100%" mb={8} radius="xl" />
      <Skeleton height={40} width="100%" mb={8} radius="xl" />
      <Skeleton height={40} width="100%" mb={8} radius="xl" />
    </div>
  );
};
