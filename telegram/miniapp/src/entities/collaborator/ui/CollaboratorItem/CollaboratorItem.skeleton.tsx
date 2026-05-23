import { Box, Group } from '@mantine/core';
import { Skeleton } from 'shared/ui/Skeleton';

export const CollaboratorItemSkeleton = () => {
  return (
    <Box>
      <Group gap={12} align="flex-start">
        <Skeleton variant="circular" width={40} height={40} />
        <Box
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          <Skeleton width={140} height={16} />
          <Skeleton width={100} height={13} />
        </Box>
      </Group>
    </Box>
  );
};
