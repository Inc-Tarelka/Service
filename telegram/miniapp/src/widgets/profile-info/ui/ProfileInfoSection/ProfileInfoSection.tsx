import { Badge, Box, Group, Stack } from '@mantine/core';
import { User } from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';
import classes from './ProfileInfoSection.module.scss';

interface ProfileInfoSectionProps {
  user?: User;
  isPublicView?: boolean;
}

export const ProfileInfoSection = ({
  user = MOCK_USER,
}: ProfileInfoSectionProps) => {
  return (
    <Box className={classes.container}>
      <Stack gap="xl">
        <Stack gap="sm">
          <h4 className={classes.title}>О себе</h4>
          <p className={classes.about}>{user.about}</p>
        </Stack>

        <Group gap="xs">
          {user.tags?.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              color="green"
              className={classes.tag}
              size="lg"
            >
              {tag}
            </Badge>
          ))}
        </Group>

        <Stack gap="xs" mt="sm">
          <Group justify="space-between">
            <span className={classes.label}>Город</span>
            <span className={classes.value}>{user.city}</span>
          </Group>
          <Group justify="space-between">
            <span className={classes.label}>Статус</span>
            <span className={classes.value}>{user.status}</span>
          </Group>
          <Group justify="space-between" align="flex-start">
            <span className={classes.label}>Образование</span>
            <span
              className={classes.value}
              style={{ width: '60%', textAlign: 'right' }}
            >
              {user.education}
            </span>
          </Group>
          <Group justify="space-between" align="flex-start">
            <span className={classes.label}>Специализация</span>
            <span
              className={classes.value}
              style={{ width: '60%', textAlign: 'right' }}
            >
              {user.specialization}
            </span>
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};
