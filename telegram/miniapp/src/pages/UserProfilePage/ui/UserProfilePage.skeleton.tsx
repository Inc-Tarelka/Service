import { Box, SimpleGrid, Stack } from '@mantine/core';
import { Skeleton } from 'shared/ui/Skeleton';
import { Page } from 'widgets/Page';
import classes from './UserProfilePage.module.scss';

export const UserProfilePageSkeleton = () => {
  return (
    <Page className={classes.profilePage}>
      {/* Banner + avatar */}
      <Box style={{ position: 'relative' }}>
        <Skeleton height={200} borderRadius={0} />
        <Stack
          align="center"
          gap={8}
          style={{ marginTop: -50, paddingBottom: 16 }}
        >
          <Skeleton variant="circular" width={100} height={100} />
          <Skeleton width={160} height={22} />
          <Skeleton width={120} height={14} />
          <Skeleton width={100} height={14} />
        </Stack>
      </Box>

      {/* Offer collaboration button */}
      <Box style={{ padding: '12px 16px 8px' }}>
        <Skeleton height={50} borderRadius={100} />
      </Box>

      {/* Tabs bar */}
      <Box
        style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 16 }}
      >
        <Skeleton height={36} borderRadius={20} width={120} />
        <Skeleton height={36} borderRadius={20} width={80} />
      </Box>

      {/* Publications grid */}
      <SimpleGrid
        cols={2}
        spacing={4}
        verticalSpacing={4}
        style={{ padding: '0 0 24px' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={140} borderRadius={16} />
        ))}
      </SimpleGrid>
    </Page>
  );
};
