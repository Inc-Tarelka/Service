import { Button } from '@mantine/core';
import { PostCollaborator } from 'shared/api/service/Post/types';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import classes from './AddCollaborators.module.scss';

interface AddCollaboratorsProps {
  collaborators: PostCollaborator[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export const AddCollaborators = (props: AddCollaboratorsProps) => {
  const { collaborators, onAdd, onRemove } = props;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
                <div className={classes.avatarPlaceholder}>
                  {getInitials(collaborator.name)}
                </div>
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
        onClick={onAdd}
        leftSection={<PlusIcon />}
      >
        Добавить
      </Button>
    </div>
  );
};
