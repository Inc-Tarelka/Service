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
import type { MyProject } from 'shared/api/service/Publication/types';
import { Skeleton } from 'shared/ui/Skeleton';
import { classNames } from 'shared/library/ClassNames/classNames';
import classes from './OfferCollaborationButton.module.scss';

interface ProjectPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: MyProject[];
  isLoading: boolean;
  onSelect: (project: MyProject) => void;
}

export const ProjectPickerDrawer = (props: ProjectPickerDrawerProps) => {
  const { isOpen, onClose, projects, isLoading, onSelect } = props;
  const { theme } = useTheme();
  const [tempSelected, setTempSelected] = useState<MyProject | null>(null);

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
      zIndex={300}
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
        <h2
          className={classNames(classes.drawerTitle, {}, [
            classes.pickerHeader,
          ])}
        >
          Ваши проекты
        </h2>

        <div className={classes.pickerList}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Group
                  key={i}
                  gap={12}
                  align="center"
                  className={classes.projectItem}
                >
                  <Skeleton width={48} height={48} borderRadius={8} />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={12} width="85%" />
                  </Stack>
                </Group>
              ))
            : projects.map((project) => (
                <Box
                  key={project.id}
                  className={classNames(classes.projectItem, {
                    [classes.projectItemSelected]:
                      tempSelected?.id === project.id,
                  })}
                  onClick={() => setTempSelected(project)}
                >
                  <div className={classes.projectThumb}>
                    {project.image && (
                      <img
                        src={project.image}
                        alt={project.name}
                        className={classes.projectThumbImg}
                      />
                    )}
                  </div>
                  <div className={classes.projectInfo}>
                    <Text className={classes.projectName} lineClamp={1}>
                      {project.name}
                    </Text>
                    <Text className={classes.projectDesc} lineClamp={2}>
                      {project.description}
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
