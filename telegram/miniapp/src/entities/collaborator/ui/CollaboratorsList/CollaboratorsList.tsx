import { Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { SearchUser } from 'shared/api/service/UserSearch/types';
import classNames from 'shared/library/ClassNames/classNames';
import { CollaboratorItem } from '../CollaboratorItem/CollaboratorItem';
import classes from './CollaboratorsList.module.scss';

interface CollaboratorsListProps {
  className?: string;
  collaborators: SearchUser[];
  onItemClick?: (id: string) => void;
}

export const CollaboratorsList = observer((props: CollaboratorsListProps) => {
  const { className, collaborators, onItemClick } = props;

  const renderCollaborator = (collaborator: SearchUser) => {
    return (
      <CollaboratorItem
        key={collaborator.id}
        collaborator={collaborator}
        onClick={onItemClick}
      />
    );
  };

  return (
    <>
      <Stack
        gap={16}
        className={classNames(classes.collaboratorsList, {}, [className])}
      >
        {Array.isArray(collaborators)
          ? collaborators.map(renderCollaborator)
          : null}
      </Stack>
    </>
  );
});

export default CollaboratorsList;
