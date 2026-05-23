import { Box, Skeleton } from '@mantine/core';
import classes from './NotificationItem.module.scss';

export const NotificationItemSkeleton = () => (
  <Box className={classes.card} style={{ cursor: 'default' }}>
    <Box className={classes.content}>
      <Box className={classes.titleRow}>
        <Skeleton height={14} radius="sm" style={{ flex: 1 }} />
      </Box>
      <Skeleton height={12} radius="sm" width="70%" />
    </Box>
    <Skeleton height={10} radius="sm" width={60} />
  </Box>
);
