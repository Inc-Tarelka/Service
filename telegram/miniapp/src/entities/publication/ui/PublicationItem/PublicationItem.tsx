import { BackgroundImage, Box, Text } from '@mantine/core';
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
      <BackgroundImage
        src={publication.imageUrl}
        radius="lg"
        className={classes.image}
      >
        <div className={classes.overlay}>
          <div className={classes.likes}>
            <HeartIcon />
            <Text size="xs" fw={700}>
              {publication.likesCount}
            </Text>
          </div>

          <div className={classes.content}>
            <Text size="xs" className={classes.title} truncate>
              {publication.title}
            </Text>
          </div>
        </div>
      </BackgroundImage>
    </Box>
  );
};
