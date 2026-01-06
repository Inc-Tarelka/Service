import { Group, Stack, Text } from '@mantine/core';
import { UserStats as UserStatsType } from 'shared/api/service/User/types';
import classes from './UserStats.module.scss';

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <Group justify="center" gap="xl" className={classes.container}>
      <Stack gap={0} align="center">
        <Text className={classes.count}>{stats.collaborations}</Text>
        <Text className={classes.label}>коллаборации</Text>
      </Stack>

      <Stack gap={0} align="center">
        <Text className={classes.count}>{stats.wantsToWork}</Text>
        <Text
          className={classes.label}
          ta="center"
          style={{ whiteSpace: 'nowrap' }}
        >
          хотел бы поработать
        </Text>
      </Stack>

      <Stack gap={0} align="center">
        <Text className={classes.count}>{stats.projects}</Text>
        <Text className={classes.label}>проектов</Text>
      </Stack>
    </Group>
  );
};
