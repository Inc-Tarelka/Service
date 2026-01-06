import { Badge, Box, Group, Stack, Text, Title } from '@mantine/core';
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
          <Title order={4} className={classes.title}>
            О себе
          </Title>
          <Text className={classes.about}>{user.about}</Text>
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
            <Text className={classes.label}>Город</Text>
            <Text className={classes.value}>{user.city}</Text>
          </Group>
          <Group justify="space-between">
            <Text className={classes.label}>Статус</Text>
            <Text className={classes.value}>{user.status}</Text>
          </Group>
          <Group justify="space-between" align="flex-start">
            <Text className={classes.label}>Образование</Text>
            <Text
              className={classes.value}
              style={{ width: '60%', textAlign: 'right' }}
            >
              {user.education}
            </Text>
          </Group>
          <Group justify="space-between" align="flex-start">
            <Text className={classes.label}>Специализация</Text>
            <Text
              className={classes.value}
              style={{ width: '60%', textAlign: 'right' }}
            >
              {user.specialization}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Box>
  );
};
