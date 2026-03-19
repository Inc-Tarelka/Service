import { ActionIcon, Button, Drawer, Text } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import type { DetailsNeedsResponse } from 'shared/api/service/Needs/types';
import XIcon from 'shared/assets/icons/x';
import classes from './NeedDetailsDrawer.module.scss';
import { NeedDetailsDrawerSkeleton } from './NeedDetailsDrawer.skeleton';

interface NeedDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  onRespond: () => void;
  needId: number | null;
}

export const NeedDetailsDrawer = observer((props: NeedDetailsDrawerProps) => {
  const { opened, onClose, onRespond, needId } = props;
  const { needsStore } = useStore();

  useEffect(() => {
    if (opened && needId) {
      needsStore.getNeedDetailsAction(needId.toString());
    }
  }, [opened, needId, needsStore]);

  const isLoadingDetails = needId
    ? needsStore.isLoadingDetails(needId.toString())
    : false;
  const needDetails = needId ? needsStore.needDetails(needId.toString()) : null;

  const formatDeadline = (date?: string) => {
    if (!date) return '';
    return dayjs(date).format('DD.MM.YYYY');
  };

  const deadlineString = [
    formatDeadline(needDetails?.deadlineStart),
    formatDeadline(needDetails?.deadlineEnd),
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="md"
      withCloseButton={false}
      padding={24}
      radius={40}
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className={classes.drawer}>
        <div className={classes.content}>
          {isLoadingDetails ? (
            <NeedDetailsDrawerSkeleton />
          ) : !needDetails ? null : (
            <>
              <div className={classes.header}>
                <Text className={classes.title}>{needDetails.name}</Text>
              </div>

              <div className={classes.description}>
                {needDetails.description}
              </div>

              {needDetails.tags && needDetails.tags.length > 0 && (
                <div className={classes.row}>
                  <span className={classes.label}>Теги</span>
                  <span className={classes.value}>
                    {needDetails.tags
                      .map((t: DetailsNeedsResponse['tags'][0]) => t.name)
                      .join(', ')}
                  </span>
                </div>
              )}

              {deadlineString && (
                <div className={classes.row}>
                  <span className={classes.label}>Сроки</span>
                  <span className={classes.value}>{deadlineString}</span>
                </div>
              )}

              {needDetails.budget && (
                <div className={classes.row}>
                  <span className={classes.label}>Бюджет</span>
                  <span className={classes.value}>{needDetails.budget} ₽</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={classes.footer}>
          <ActionIcon variant="outline" size={48} radius="16" onClick={onClose}>
            <XIcon />
          </ActionIcon>
          <Button
            radius="xl"
            variant="filled"
            fullWidth
            size="lg"
            onClick={onRespond}
            c="var(--bg-color)"
          >
            Откликнуться
          </Button>
        </div>
      </div>
    </Drawer>
  );
});
