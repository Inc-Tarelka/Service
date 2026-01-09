import {
  ActionIcon,
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useState } from 'react';
import { Interaction } from 'shared/api/service/Interaction/types';
import EyeOffIcon from 'shared/assets/icons/EyeOff';
import MoreIcon from 'shared/assets/icons/more';
import TrashIcon from 'shared/assets/icons/trash';
import { classNames } from 'shared/library/ClassNames/classNames';
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
  const [isOpen, setOpen] = useState(false);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const isOffer = interaction.type === 'offer';

  return (
    <>
      <div className={classes.card} onClick={onClick}>
        <div className={classes.header}>
          <span className={classes.title}>
            {isOffer ? 'Отклик на потребность' : 'Запрос на сотрудничество'}
          </span>
          {canEdit && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={handleMoreClick}
            >
              <MoreIcon />
            </ActionIcon>
          )}
        </div>

        <p className={classes.description}>{interaction.description}</p>

        <div className={classes.footer}>
          <img
            src={interaction.initiator.avatarUrl}
            alt="avatar"
            className={classNames(classes.avatar, {
              [classes.rounded]: isOffer,
              [classes.circular]: !isOffer,
            })}
          />
          <div className={classes.info}>
            <span className={classes.mainText}>
              {isOffer
                ? interaction.projectName || 'Без названия'
                : `${interaction.initiator.firstName} ${interaction.initiator.lastName}`}
            </span>
            <span className={classes.subText}>
              {isOffer
                ? 'Описание проекта текстовое...'
                : `@${interaction.initiator.username}`}
            </span>
          </div>
          {isOffer && (
            <ActionIcon variant="transparent" color="gray">
              <MoreIcon />
            </ActionIcon>
          )}
        </div>
      </div>

      <Drawer
        opened={isOpen}
        onClose={() => setOpen(false)}
        position="bottom"
        size={135}
        withCloseButton={false}
        padding={0}
      >
        <Stack gap="xl" justify="center">
          <UnstyledButton
            className={classes.sheetButton}
            onClick={() => setOpen(false)}
          >
            <Group gap="md">
              <EyeOffIcon />
              <Text size="md" fw={500} c="white">
                Скрыть
              </Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={classes.sheetButton}
            onClick={() => setOpen(false)}
          >
            <Group gap="md">
              <TrashIcon color="#ff5d5d" />
              <Text size="md" fw={500} c="red">
                Удалить
              </Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </Drawer>
    </>
  );
};
