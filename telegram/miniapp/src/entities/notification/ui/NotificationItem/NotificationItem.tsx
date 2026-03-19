import { Box, Text } from '@mantine/core';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import { classNames } from 'shared/library/ClassNames/classNames';
import { NOTIFICATION_CARD_VARIANT } from '../../consts';
import type { NotificationCardVariant } from '../../consts';
import classes from './NotificationItem.module.scss';

interface NotificationItemProps {
  variant: NotificationCardVariant;
  username?: string;
  title: string;
  body?: string;
  date: string;
  isRead?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationItem = (props: NotificationItemProps) => {
  const {
    variant,
    username,
    title,
    body,
    date,
    isRead = false,
    onClick,
    className,
  } = props;

  return (
    <Box
      className={classNames(classes.card, { [classes.unread]: !isRead }, [
        className,
      ])}
      onClick={onClick}
    >
      <Box className={classes.content}>
        <Box className={classes.titleRow}>
          <Text className={classes.title}>
            {username && <span className={classes.username}>{username} </span>}
            {title}
          </Text>
          <ChevronRightIcon className={classes.chevron} />
        </Box>
        {variant === NOTIFICATION_CARD_VARIANT.WITH_BODY && body && (
          <Text className={classes.body}>{body}</Text>
        )}
      </Box>
      <Text className={classes.date}>{date}</Text>
    </Box>
  );
};
