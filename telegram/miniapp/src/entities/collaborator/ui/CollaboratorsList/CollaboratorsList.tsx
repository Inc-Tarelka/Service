import { Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { User } from 'shared/api/service/User/types';
import classNames from 'shared/library/ClassNames/classNames';
import { CollaboratorItem } from '../CollaboratorItem/CollaboratorItem';
import classes from './CollaboratorsList.module.scss';

interface CollaboratorsListProps {
  className?: string;
  collaborators: User[];
  onItemClick?: (id: string) => void;
}

export const CollaboratorsList = observer((props: CollaboratorsListProps) => {
  const { className, collaborators, onItemClick } = props;

  const renderCollaborator = (collaborator: User) => {
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
      <div className={classes.line}></div>
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
