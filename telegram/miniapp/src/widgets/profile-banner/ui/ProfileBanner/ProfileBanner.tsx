import { ActionIcon, Box, Group, Stack } from '@mantine/core';
import { UserAvatar, UserStats } from 'entities/user';
import { EditProfileButton } from 'features/edit-profile';
import { User } from 'shared/api/service/User/types';
import classes from './ProfileBanner.module.scss';
import ShareIcon from 'shared/assets/icons/share';

interface ProfileBannerProps {
  user: User;
  isOwnProfile: boolean;
}

export const ProfileBanner = ({ user, isOwnProfile }: ProfileBannerProps) => {
  return (
    <Box className={classes.container}>
      <div className={classes.cover}>
        <Group justify="space-between" p="md" className={classes.header}>
          <span className={classes.username}>@{user.username}</span>

          <Group gap="xs">
            {isOwnProfile ? (
              <EditProfileButton />
            ) : (
              <ActionIcon variant="transparent" c="white">
                <ShareIcon />
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
          <span className={classes.name}>
            {user.firstName} {user.lastName}
          </span>
          <span className={classes.profession}>
            {user.profession}, {user.city}
          </span>
        </Stack>

        <Box mt="md" w="100%">
          <UserStats stats={user.stats} />
        </Box>
      </Stack>
    </Box>
  );
};
