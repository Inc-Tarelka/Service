import { Button } from '@mantine/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { PostCollaborator } from 'shared/api/service/Post/types';
import type { SearchUser } from 'shared/api/service/UserSearch/types';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import { SearchUserDrawer } from '../SearchUserDrawer/SearchUserDrawer';
import classes from './AddCollaborators.module.scss';

interface AddCollaboratorsProps {
  collaborators: PostCollaborator[];
  onRemove: (id: string) => void;
  onUserSelect: (user: SearchUser) => void;
}

export const AddCollaborators = (props: AddCollaboratorsProps) => {
  const { collaborators, onRemove, onUserSelect } = props;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSearchDrawerOpened = searchParams.get('drawer') === 'searchUser';

  const handleOpenDrawer = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('drawer', 'searchUser');
    setSearchParams(newParams, { replace: false });
  };

  const handleCloseDrawer = () => {
    if (isSearchDrawerOpened) {
      navigate(-1);
    }
  };

  const visibleCollaborators = collaborators.filter(
    (c) => c.status === 'confirmed' || c.status === 'pending',
  );

  return (
    <div className={classes.section}>
      <div className={classes.header}>
        <span className={classes.title}>Сокомандники</span>
        <span className={classes.subtitle}>
          Они будут отображаться в публикации после подтверждения с их стороны.
        </span>
      </div>

      {visibleCollaborators.length > 0 && (
        <div className={classes.list}>
          {visibleCollaborators.map((collaborator) => (
            <div key={collaborator.id} className={classes.collaboratorItem}>
              {collaborator.avatarUrl ? (
                <img
                  src={collaborator.avatarUrl}
                  alt={collaborator.name}
                  className={classes.avatar}
                />
              ) : (
                <img
                  src={defaultUserSvg}
                  alt={collaborator.name}
                  className={classes.avatar}
                />
              )}
              <div className={classes.info}>
                <span className={classes.name}>{collaborator.name}</span>
                <span className={classes.profession}>
                  {collaborator.profession}, {collaborator.city}
                </span>
                {collaborator.status === 'pending' && (
                  <span className={classes.pending}>Ожидает подтверждения</span>
                )}
              </div>
              {collaborator.status === 'pending' && (
                <span className={classes.statusIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </span>
              )}
              <button
                type="button"
                className={classes.removeButton}
                onClick={() => onRemove(collaborator.id)}
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        fullWidth
        radius="xl"
        className={classes.addButton}
        size="lg"
        onClick={handleOpenDrawer}
        leftSection={<PlusIcon />}
      >
        Добавить
      </Button>

      <SearchUserDrawer
        opened={isSearchDrawerOpened}
        onClose={handleCloseDrawer}
        onUserSelect={(user) => {
          onUserSelect(user);
          handleCloseDrawer();
        }}
      />
    </div>
  );
};
