import { Button, Drawer, Loader, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator/ui/CollaboratorsList/CollaboratorsList';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type { CoauthorSearchUser } from 'shared/api/service/UserSearch/types';
import SearchIcon from 'shared/assets/icons/search';
import classes from './MasterSearchDrawer.module.scss';

export type MasterSelection =
  | {
      type: 'tarelka';
      id: number;
      name: string;
    }
  | {
      type: 'custom';
      name: string;
    };

interface MasterSearchDrawerProps {
  opened: boolean;
  value: MasterSelection | null;
  onClose: () => void;
  onChange: (value: MasterSelection | null) => void;
}

const formatMasterName = (user: CoauthorSearchUser): string => {
  return `${user.name ?? ''} ${user.surname ?? ''}`.trim();
};

export const MasterSearchDrawer = observer((props: MasterSearchDrawerProps) => {
  const { opened, value, onClose, onChange } = props;
  const { searchUsersStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [draftSelection, setDraftSelection] = useState<MasterSelection | null>(
    value,
  );

  useEffect(() => {
    if (opened) {
      setSearchQuery(value?.name ?? '');
      setDraftSelection(value);
      return;
    }

    setSearchQuery('');
    setDraftSelection(value);
    searchUsersStore.reset();
  }, [opened, value, searchUsersStore]);

  useEffect(() => {
    if (!opened) return;

    const query = debouncedQuery.trim();
    if (query) {
      searchUsersStore.searchCoauthorsAction({ q: query });
    } else {
      searchUsersStore.reset();
    }
  }, [debouncedQuery, opened, searchUsersStore]);

  const closeWithCommit = (forcedSelection?: MasterSelection | null) => {
    const normalizedQuery = searchQuery.trim();
    let nextSelection =
      forcedSelection !== undefined ? forcedSelection : draftSelection;

    if (forcedSelection === undefined) {
      if (normalizedQuery) {
        if (!nextSelection || nextSelection.name !== normalizedQuery) {
          nextSelection = {
            type: 'custom',
            name: normalizedQuery,
          };
        }
      } else {
        nextSelection = null;
      }
    }

    onChange(nextSelection ?? null);
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    const normalizedValue = nextValue.trim();

    setSearchQuery(nextValue);
    setDraftSelection((prev) => {
      if (!normalizedValue) {
        return null;
      }

      if (prev?.type === 'tarelka' && prev.name === normalizedValue) {
        return prev;
      }

      return {
        type: 'custom',
        name: normalizedValue,
      };
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => closeWithCommit()}
      position="bottom"
      size="100%"
      withCloseButton={false}
      classNames={{ content: 'drawer-fulldevice' }}
      styles={{
        content: {
          borderRadius: '32px 32px 0 0',
          backgroundColor: 'var(--bg-color)',
        },
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className={classes.drawer}>
        <div className={classes.searchHeader}>
          <TextInput
            classNames={{
              input: classes.searchInput,
            }}
            placeholder="Выберите мастера или введите имя"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                closeWithCommit();
              }
            }}
            rightSection={<SearchIcon className={classes.searchIcon} />}
            radius={16}
            size="lg"
          />
          <Text className={classes.hintText}>
            Выберите мастера из списка или введите имя вручную.
          </Text>
        </div>

        <div className={classes.scrollContent}>
          {searchUsersStore.isCoauthorsLoading ? (
            <div className={classes.loaderContainer}>
              <Loader color="var(--accent-color)" />
            </div>
          ) : searchUsersStore.coauthorsError ? (
            <Text className={classes.errorText} ta="center" mt="md" c="red">
              Ошибка загрузки пользователей
            </Text>
          ) : searchUsersStore.coauthors.length > 0 ? (
            <CollaboratorsList
              collaborators={searchUsersStore.coauthors}
              onItemClick={(id) => {
                const user = searchUsersStore.coauthors.find(
                  (item: CoauthorSearchUser) => String(item.id) === id,
                );

                if (!user) {
                  return;
                }

                const name = formatMasterName(user) || user.name?.trim() || '';
                const nextSelection: MasterSelection = {
                  type: 'tarelka',
                  id: user.id,
                  name,
                };

                setDraftSelection(nextSelection);
                setSearchQuery(name);
                closeWithCommit(nextSelection);
              }}
            />
          ) : debouncedQuery.trim() ? (
            <Text className={classes.emptyText} ta="center" mt="md">
              Пользователь не найден.
            </Text>
          ) : null}
        </div>

        {!searchUsersStore.isCoauthorsLoading &&
          !searchUsersStore.coauthorsError &&
          debouncedQuery.trim() &&
          searchUsersStore.coauthors.length === 0 && (
            <div className={classes.footer}>
              <Button
                radius="xl"
                size="lg"
                fullWidth
                onClick={() => closeWithCommit()}
                className={classes.saveButton}
              >
                Сохранить
              </Button>
            </div>
          )}
      </div>
    </Drawer>
  );
});
