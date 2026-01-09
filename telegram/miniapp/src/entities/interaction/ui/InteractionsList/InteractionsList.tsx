import { Stack } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Interaction } from 'shared/api/service/Interaction/types';
import classNames from 'shared/library/ClassNames/classNames';
import { InteractionItem } from '../InteractionItem/InteractionItem';
import s from './InteractionsList.module.scss';

interface InteractionsListProps {
  className?: string;
  interactions: Interaction[];
  canEdit?: boolean;
  isLoading?: boolean;
  onItemClick?: () => void;
}

export const InteractionsList = observer((props: InteractionsListProps) => {
  const { className, interactions, canEdit, onItemClick } = props;

  const renderInteraction = (interaction: Interaction) => {
    return (
      <InteractionItem
        key={interaction.id}
        interaction={interaction}
        canEdit={canEdit}
        onClick={onItemClick}
      />
    );
  };

  return (
    <Stack gap="sm" className={classNames(s.interactionsList, {}, [className])}>
      {Array.isArray(interactions) ? interactions.map(renderInteraction) : null}
    </Stack>
  );
});

export default InteractionsList;
