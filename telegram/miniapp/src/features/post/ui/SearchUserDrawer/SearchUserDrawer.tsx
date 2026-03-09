import { Drawer, Loader, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator/ui/CollaboratorsList/CollaboratorsList';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { SearchUser } from 'shared/api/service/UserSearch/types';
import SearchIcon from 'shared/assets/icons/search';
import classes from './SearchUserDrawer.module.scss';

interface SearchUserDrawerProps {
  opened: boolean;
  onClose: () => void;
  onUserSelect: (user: SearchUser) => void;
}

export const SearchUserDrawer = observer((props: SearchUserDrawerProps) => {
  const { opened, onClose, onUserSelect } = props;
  const { searchUsersStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    if (opened) {
      if (debouncedQuery.trim()) {
        searchUsersStore.searchUsersAction({ q: debouncedQuery });
      } else {
        searchUsersStore.reset();
      }
    }
  }, [debouncedQuery, opened, searchUsersStore]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
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
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={<SearchIcon className={classes.searchIcon} />}
            radius={16}
            size="lg"
          />
        </div>

        <div className={classes.scrollContent}>
          {searchUsersStore.isLoading ? (
            <div className={classes.loaderContainer}>
              <Loader color="var(--accent-color)" />
            </div>
          ) : searchUsersStore.error ? (
            <Text className={classes.errorText} ta="center" mt="md" color="red">
              Ошибка загрузки пользователей
            </Text>
          ) : searchUsersStore.users.length > 0 ? (
            <CollaboratorsList
              collaborators={searchUsersStore.users}
              onItemClick={(id) => {
                const user = searchUsersStore.users.find(
                  (u: SearchUser) => String(u.id) === id,
                );
                if (user) {
                  onUserSelect(user);
                  handleClose();
                }
              }}
            />
          ) : debouncedQuery ? (
            <Text className={classes.emptyText} ta="center" mt="md">
              Пользователи не найдены
            </Text>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
});
