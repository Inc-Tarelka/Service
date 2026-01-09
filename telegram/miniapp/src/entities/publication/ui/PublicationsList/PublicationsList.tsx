import { SimpleGrid } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Publication } from 'shared/api/service/Publication/types';
import classNames from 'shared/library/ClassNames/classNames';
import { PublicationItem } from '../PublicationItem/PublicationItem';
import s from './PublicationsList.module.scss';

interface PublicationsListProps {
  className?: string;
  publications: Publication[];
  isLoading?: boolean;
  onItemClick?: (id: string) => void;
}

export const PublicationsList = observer((props: PublicationsListProps) => {
  const { className, publications, onItemClick } = props;

  const renderPublication = (publication: Publication) => {
    return (
      <PublicationItem
        key={publication.id}
        publication={publication}
        onClick={onItemClick}
      />
    );
  };

  return (
    <SimpleGrid
      cols={2}
      spacing={16}
      verticalSpacing={16}
      className={classNames(s.publicationsList, {}, [className])}
    >
      {Array.isArray(publications) ? publications.map(renderPublication) : null}
    </SimpleGrid>
  );
});

export default PublicationsList;
