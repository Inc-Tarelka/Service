import { ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { CollaborationRequestDrawer } from '../CollaborationRequestDrawer/CollaborationRequestDrawer';
import { OfferDetailsDrawer } from '../OfferDetailsDrawer/OfferDetailsDrawer';
import classes from './InteractionItem.module.scss';

interface InteractionItemProps {
  interaction: Interaction;
  canEdit?: boolean;
  onClick?: () => void;
}

export const InteractionItem = ({
  interaction,
  canEdit,
  onClick,
}: InteractionItemProps) => {
  const [isDetailOpen, setDetailOpen] = useState(false);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailOpen(true);
  };

  const handleCardClick = () => {
    setDetailOpen(true);
    onClick?.();
  };

  const isOffer = interaction.type === 'offer';

  return (
    <>
      <div className={classes.card} onClick={handleCardClick}>
        <div className={classes.header}>
          <span className={classes.title}>
            {isOffer ? 'Отклик на потребность' : 'Запрос на сотрудничество'}
          </span>
          {canEdit && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={handleChevronClick}
            >
              <ChevronRightIcon className={classes.chevron} />
            </ActionIcon>
          )}
        </div>

        <p className={classes.description}>{interaction.description}</p>
      </div>

      {isOffer ? (
        <OfferDetailsDrawer
          opened={isDetailOpen}
          onClose={() => setDetailOpen(false)}
          interaction={interaction}
        />
      ) : (
        <CollaborationRequestDrawer
          opened={isDetailOpen}
          onClose={() => setDetailOpen(false)}
          interaction={interaction}
        />
      )}
    </>
  );
};
