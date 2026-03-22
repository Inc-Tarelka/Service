import { Box, Text } from '@mantine/core';
import { Publication } from 'shared/api/service/Publication/types';
import { UserProfilePublication } from 'shared/api/service/User/types';
import HeartIcon from 'shared/assets/icons/heart';
import classes from './PublicationItem.module.scss';

interface PublicationItemProps {
  publication: Publication | UserProfilePublication;
  onClick?: (id: number) => void;
}

export const PublicationItem = ({
  publication,
  onClick,
}: PublicationItemProps) => {
  const imageUrl =
    'imageUrls' in publication
      ? publication.imageUrls?.[0]
      : publication.imageUrl;
  const likesCount = 'likesCount' in publication ? publication.likesCount : 0;

  return (
    <Box
      className={classes.container}
      onClick={() => onClick?.(publication.id)}
    >
      <div
        className={classes.image}
        style={{
          backgroundImage: `url(${imageUrl || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={classes.overlay}>
          <div className={classes.likes}>
            <HeartIcon />
            <Text size="xs" fw={700}>
              {likesCount}
            </Text>
          </div>
        </div>
      </div>
    </Box>
  );
};
