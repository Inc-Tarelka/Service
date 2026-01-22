import { Avatar, Box, Group, Text } from '@mantine/core';
import { User } from 'shared/api/service/User/types';
import classes from './CollaboratorItem.module.scss';

interface CollaboratorItemProps {
  collaborator: User;
  onClick?: (id: string) => void;
}

export const CollaboratorItem = ({
  collaborator,
  onClick,
}: CollaboratorItemProps) => {
  return (
    <Box className={classes.card} onClick={() => onClick?.(collaborator.id)}>
      <Group gap={12} align="flex-start">
        <Avatar src={collaborator.avatarUrl} size={40} radius="xl" />
        <Box className={classes.userInfo}>
          <Text color="white" className={classes.cardTitle}>
            {collaborator.firstName} {collaborator.lastName}
          </Text>
          <Text className={classes.cardDescription}>
            @{collaborator.username}
          </Text>
          <Text color="white" className={classes.cardDescription}>
            {collaborator.profession}, {collaborator.city}
          </Text>
        </Box>
      </Group>
    </Box>
  );
};
