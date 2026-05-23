import { ActionIcon, Box, Menu, Text } from '@mantine/core';
import { Publication } from 'shared/api/service/Publication/types';
import { UserProfilePublication } from 'shared/api/service/User/types';
import HeartIcon from 'shared/assets/icons/heart';
import classes from './PublicationItem.module.scss';

interface PublicationItemProps {
  publication: Publication | UserProfilePublication;
  onClick?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PublicationItem = (props: PublicationItemProps) => {
  const { publication, onClick, onDelete } = props;

  const imageUrl =
    'imageUrls' in publication
      ? publication.imageUrls?.[0]
      : publication.imageUrl;
  const likesCount = 'likesCount' in publication ? publication.likesCount : 0;
  const isAuthor = 'isAuthor' in publication ? publication.isAuthor : false;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(publication.id);
  };

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
          {isAuthor && onDelete && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="transparent"
                  c="white"
                  size="sm"
                  className={classes.menuButton}
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋮
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" onClick={handleDelete}>
                  Удалить
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
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
