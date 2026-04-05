import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { useTheme } from 'app/providers/ThemeProvider';
import { useState } from 'react';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import type { MyService } from 'shared/api/service/Publication/types';
import { Skeleton } from 'shared/ui/Skeleton';
import { classNames } from 'shared/library/ClassNames/classNames';
import classes from './ResponseToNeedDrawer.module.scss';

export type { MyService };

interface ServicePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  services: MyService[];
  isLoading: boolean;
  onSelect: (service: MyService) => void;
}

export const ServicePickerDrawer = (props: ServicePickerDrawerProps) => {
  const { isOpen, onClose, services, isLoading, onSelect } = props;
  const { theme } = useTheme();
  const [tempSelected, setTempSelected] = useState<MyService | null>(null);

  const handleAdd = () => {
    if (tempSelected) {
      onSelect(tempSelected);
    }
    onClose();
  };

  const handleClose = () => {
    setTempSelected(null);
    onClose();
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={handleClose}
      size="lg"
      position="bottom"
      withCloseButton={false}
      zIndex={400}
      className={theme}
      styles={{
        content: {
          backgroundColor: 'var(--tertiary-bg-color)',
          borderRadius: '32px 32px 0 0',
        },
        body: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0,
        },
      }}
    >
      <div className={classNames(classes.pickerInner, {}, [theme])}>
        <h2 className={classes.pickerTitle}>Ваши услуги</h2>

        <div className={classes.pickerList}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Group
                  key={i}
                  gap={12}
                  align="center"
                  className={classes.pickerItem}
                >
                  <Skeleton width={48} height={48} borderRadius={8} />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={12} width="85%" />
                  </Stack>
                </Group>
              ))
            : services.map((service) => (
                <Box
                  key={service.id}
                  className={classNames(classes.pickerItem, {
                    [classes.pickerItemSelected]:
                      tempSelected?.id === service.id,
                  })}
                  onClick={() => setTempSelected(service)}
                >
                  <div className={classes.pickerThumb}>
                    {service.imageUrl && (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className={classes.pickerThumbImg}
                      />
                    )}
                  </div>
                  <div className={classes.pickerInfo}>
                    <Text className={classes.pickerName} lineClamp={1}>
                      {service.name}
                    </Text>
                    <Text className={classes.pickerDesc} lineClamp={2}>
                      {service.description}
                    </Text>
                  </div>
                </Box>
              ))}
        </div>

        <div className={classes.pickerActions}>
          <ActionIcon
            onClick={handleClose}
            variant="outline"
            size={48}
            radius="16"
            styles={{
              root: {
                border: '1px solid var(--inverted-bg-color)',
                color: 'var(--text-color)',
                backgroundColor: 'transparent',
                flexShrink: 0,
              },
            }}
          >
            <ArrowLeftIcon />
          </ActionIcon>
          <Button
            fullWidth
            radius="xl"
            size="lg"
            variant="filled"
            onClick={handleAdd}
            disabled={!tempSelected || isLoading}
            bg="var(--accent-color)"
            c="var(--bg-color)"
          >
            Добавить
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
