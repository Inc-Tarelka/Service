import { Box, Stack } from '@mantine/core';
import { Skeleton } from 'shared/ui/Skeleton';
import { Page } from 'widgets/Page';
import classes from './UserProfilePage.module.scss';

export const UserProfilePageSkeleton = () => {
  return (
    <Page className={classes.profilePage}>
      <Box>
        <Skeleton height={200} borderRadius={0} />
        <Stack align="center" mt={-50} gap="sm" p="md">
          <Skeleton variant="circular" width={100} height={100} />
          <Skeleton width={180} height={20} />
          <Skeleton width={120} height={14} />
        </Stack>
      </Box>
    </Page>
  );
};
