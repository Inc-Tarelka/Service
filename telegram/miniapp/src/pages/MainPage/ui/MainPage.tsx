import { ActionIcon, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import FilterIcon from 'shared/assets/icons/filter';
import SearchIcon from 'shared/assets/icons/search';
import classNames from 'shared/library/ClassNames/classNames';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page/ui/Page';
import s from './MainPage.module.scss';

export const MainPage = observer(() => {
  const [activeTab, setActiveTab] = useState('profiles');

  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      <div className={s.header}>
        <div className={s.searchRow}>
          <TextInput
            className={s.search}
            rightSection={<SearchIcon />}
            placeholder={'Поиск'}
            radius="xl"
            size="lg"
          />
          <ActionIcon
            className={s.filterBtn}
            variant="outline"
            size={48}
            radius={12}
          >
            <FilterIcon />
          </ActionIcon>
        </div>
        <TabsSwitcher
          tabs={[
            { label: 'Профили', value: 'profiles' },
            { label: 'Услуги', value: 'services' },
            { label: 'Потребности', value: 'needs' },
          ]}
          activeTab={activeTab}
          className={s.tabs}
          onTabChange={setActiveTab}
        />
      </div>
    </Page>
  );
});

export default MainPage;
