import { useStore } from 'app/StoreProvider';
import {
  NeedListingList,
  ProfileListingList,
  ServiceListingList,
} from 'entities/search-listing';
import { SearchPublications } from 'features/search-publications';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { SearchPublicationsType } from 'shared/api/types';
import classNames from 'shared/library/ClassNames/classNames';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page/ui/Page';
import s from './MainPage.module.scss';

export const MainPage = observer(() => {
  const { searchPublicationStore } = useStore();
  const [activeTab, setActiveTab] = useState<SearchPublicationsType>(
    SearchPublicationsType.PROFILE,
  );

  const publications = searchPublicationStore.publications;
  const isLoading = searchPublicationStore.isLoading;

  const handleItemClick = (id: number) => {
    console.log('Clicked publication:', id);
  };

  const renderContent = () => {
    if (!searchPublicationStore.isLoaded && !isLoading) {
      return null;
    }

    switch (activeTab) {
      case SearchPublicationsType.PROFILE:
        return (
          <ProfileListingList
            publications={publications}
            onItemClick={handleItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.SERVICE:
        return (
          <ServiceListingList
            publications={publications}
            onItemClick={handleItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.NEED:
        return (
          <NeedListingList
            publications={publications}
            onItemClick={handleItemClick}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      <div className={s.header}>
        <SearchPublications activeTab={activeTab} />
        <TabsSwitcher
          tabs={[
            { label: 'Профили', value: SearchPublicationsType.PROFILE },
            { label: 'Услуги', value: SearchPublicationsType.SERVICE },
            { label: 'Потребности', value: SearchPublicationsType.NEED },
          ]}
          activeTab={activeTab}
          className={s.tabs}
          onTabChange={(tab) => setActiveTab(tab as any)}
        />
      </div>
      <div className={s.content}>{renderContent()}</div>
    </Page>
  );
});

export default MainPage;
