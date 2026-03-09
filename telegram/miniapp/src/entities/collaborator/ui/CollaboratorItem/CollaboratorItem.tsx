import { Box, Group, Text } from '@mantine/core';
import type { SearchUser } from 'shared/api/service/UserSearch/types';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import {
  formatCollaboratorMeta,
  formatCollaboratorName,
} from '../../lib/formatCollaborator';
import classes from './CollaboratorItem.module.scss';

interface CollaboratorItemProps {
  collaborator: SearchUser;
  onClick?: (id: string) => void;
}

export const CollaboratorItem = ({
  collaborator,
  onClick,
}: CollaboratorItemProps) => {
  const fullName = formatCollaboratorName(collaborator);
  const meta = formatCollaboratorMeta(collaborator);

  return (
    <Box
      className={classes.card}
      onClick={() => onClick?.(String(collaborator.id))}
    >
      <Group gap={12} align="flex-start">
        <img
          src={collaborator.logo_url || defaultUserSvg}
          alt={fullName}
          width={40}
          height={40}
          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <Box className={classes.userInfo}>
          <Text color="white" className={classes.cardTitle}>
            {fullName}
          </Text>
          <Text className={classes.cardDescription}>
            @{collaborator.username}
          </Text>
          {meta && (
            <Text color="white" className={classes.info}>
              {meta}
            </Text>
          )}
        </Box>
      </Group>
    </Box>
  );
};
