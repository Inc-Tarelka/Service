import { Stack } from '@mantine/core';
import { CollaboratorItemSkeleton } from '../CollaboratorItem/CollaboratorItem.skeleton';

interface CollaboratorsListSkeletonProps {
  count?: number;
}

export const CollaboratorsListSkeleton = ({
  count = 6,
}: CollaboratorsListSkeletonProps) => {
  return (
    <Stack gap={16}>
      {Array.from({ length: count }).map((_, i) => (
        <CollaboratorItemSkeleton key={i} />
      ))}
    </Stack>
  );
};
