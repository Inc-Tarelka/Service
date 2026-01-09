import { Box, Text } from '@mantine/core';
import { Publication } from 'shared/api/service/Publication/types';
import HeartIcon from 'shared/assets/icons/heart';
import classes from './PublicationItem.module.scss';

interface PublicationItemProps {
  publication: Publication;
  onClick?: (id: string) => void;
}

export const PublicationItem = ({
  publication,
  onClick,
}: PublicationItemProps) => {
  return (
    <Box
      className={classes.container}
      onClick={() => onClick?.(publication.id)}
    >
      <div
        className={classes.image}
        style={{
          backgroundImage: `url(${publication.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={classes.overlay}>
          <div className={classes.likes}>
            <HeartIcon />
            <Text size="xs" fw={700}>
              {publication.likesCount}
            </Text>
          </div>

          <div className={classes.content}>
            <Text className={classes.title} truncate>
              {publication.title}
            </Text>
          </div>
        </div>
      </div>
    </Box>
  );
};
