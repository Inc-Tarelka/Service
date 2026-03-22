import { ActionIcon, Box, CSSProperties, Group, Stack } from '@mantine/core';
import { UserAvatar, UserStats } from 'entities/user';
import { EditProfileButton } from 'features/edit-profile';
import { User } from 'shared/api/service/User/types';
import ShareIcon from 'shared/assets/icons/share';
import classes from './ProfileBanner.module.scss';

interface ProfileBannerProps {
  user: User;
  isOwnProfile: boolean;
  coverImage?: string;
  minimal?: boolean;
}

export const ProfileBanner = (props: ProfileBannerProps) => {
  const { user, isOwnProfile, coverImage, minimal = false } = props;
  const coverClassName = coverImage
    ? `${classes.cover} ${classes.withImage}`
    : classes.cover;

  const coverStyle = coverImage
    ? ({ '--cover-image': `url(${coverImage})` } as CSSProperties)
    : undefined;

  return (
    <Box className={classes.container}>
      <div className={coverClassName} style={coverStyle}>
        {!minimal && (
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
        )}
      </div>

      <Stack align="center" mt={-50} gap="xs" className={classes.content}>
        <UserAvatar
          src={user.avatarUrl}
          size={100}
          className={classes.avatar}
        />

        {!minimal && (
          <>
            <Stack gap={0} align="center">
              <span className={classes.name}>
                {user.firstName} {user.lastName}
              </span>
              <span className={classes.profession}>
                {user.profession}, {user.city}
              </span>
            </Stack>

            <Box mt="md" w="100%">
              <UserStats
                stats={
                  user.stats ?? {
                    teammatesCount: 0,
                    outgoingRequestsCount: 0,
                    projectsCount: 0,
                  }
                }
              />
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
};
