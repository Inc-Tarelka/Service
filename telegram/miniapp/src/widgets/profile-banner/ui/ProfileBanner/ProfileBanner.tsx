import { ActionIcon, Box, Group, Stack, Text } from '@mantine/core';
import { UserAvatar, UserStats } from 'entities/user';
import { EditProfileButton } from 'features/edit-profile';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from 'shared/assets/icons/chevronLeft';
import MoreIcon from 'shared/assets/icons/more';
import classes from './ProfileBanner.module.scss';
import { User } from 'shared/api/service/User/types';

interface ProfileBannerProps {
  user: User;
  isOwnProfile: boolean;
}

export const ProfileBanner = ({ user, isOwnProfile }: ProfileBannerProps) => {
  const navigate = useNavigate();

  return (
    <Box className={classes.container}>
      <div className={classes.cover}>
        <Group justify="space-between" p="md" className={classes.header}>
          {isOwnProfile ? (
            <Text c="white" fw={500}>
              @{user.username}
            </Text>
          ) : (
            <ActionIcon
              variant="transparent"
              c="white"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon />
            </ActionIcon>
          )}

          <Group gap="xs">
            {isOwnProfile ? (
              <EditProfileButton />
            ) : (
              <ActionIcon variant="transparent" c="white">
                <MoreIcon />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </div>

      <Stack align="center" mt={-50} gap="xs" className={classes.content}>
        <UserAvatar
          src={user.avatarUrl}
          size={100}
          className={classes.avatar}
        />

        <Stack gap={0} align="center">
          <Text size="xl" fw={700} c="white">
            {user.firstName} {user.lastName}
          </Text>
          <Text size="sm" c="dimmed">
            {user.profession}, {user.city}
          </Text>
        </Stack>

        <Box mt="md" w="100%">
          <UserStats stats={user.stats} />
        </Box>
      </Stack>
    </Box>
  );
};
