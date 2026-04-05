import { Box, Group } from '@mantine/core';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import {
  AnyCollaborator,
  formatCollaboratorMeta,
  formatCollaboratorName,
} from '../../lib/formatCollaborator';
import classes from './CollaboratorItem.module.scss';

interface CollaboratorItemProps {
  collaborator: AnyCollaborator;
  onClick?: (id: string) => void;
}

export const CollaboratorItem = (props: CollaboratorItemProps) => {
  const { collaborator, onClick } = props;
  const fullName = formatCollaboratorName(collaborator);
  const meta = formatCollaboratorMeta(collaborator);
  const logoUrl =
    'logo_url' in collaborator ? collaborator.logo_url : undefined;
  const username =
    'username' in collaborator ? collaborator.username : undefined;

  return (
    <Box
      className={classes.card}
      onClick={() => onClick?.(String(collaborator.id))}
    >
      <Group gap={12} align="flex-start">
        <img
          src={logoUrl || defaultUserSvg}
          alt={fullName}
          width={40}
          height={40}
          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
        <Box className={classes.userInfo}>
          <span className={classes.cardTitle}>{fullName}</span>
          {username && (
            <span className={classes.cardDescription}>@{username}</span>
          )}
          {meta && <span className={classes.info}>{meta}</span>}
        </Box>
      </Group>
    </Box>
  );
};
