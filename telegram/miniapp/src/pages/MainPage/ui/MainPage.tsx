import { useStore } from 'app/StoreProvider';
import { ResponseToNeedDrawer } from 'features/respond-to-need';
import { SearchPublications } from 'features/search-publications';
import { NeedDetailsDrawer } from 'features/view-need';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchPublicationsType } from 'shared/api/types';
import classNames from 'shared/library/ClassNames/classNames';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page/ui/Page';
import { ListingContent } from '../lib/ListingContent';
import { useNavigationLogic } from '../lib/useNavigationLogic';
import s from './MainPage.module.scss';

export const MainPage = observer(() => {
  const { searchPublicationStore } = useStore();
  const [searchParams] = useSearchParams();
  const { handleDataNavigation } = useNavigationLogic();
  const queryFromUrl = searchParams.get('query') || '';
  const tabFromUrl =
    (searchParams.get('tab') as SearchPublicationsType) ||
    SearchPublicationsType.PROFILE;

  const [activeTab, setActiveTab] =
    useState<SearchPublicationsType>(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [isNeedDetailsOpen, setIsNeedDetailsOpen] = useState(false);
  const [isResponseDrawerOpen, setIsResponseDrawerOpen] = useState(false);

  const publications = searchPublicationStore.publications;
  const isLoading = searchPublicationStore.isLoading;

  const mockNeedData = {
    title: 'Требуется дизайнер UI/UX',
    description:
      'Ищем опытного дизайнера для создания интерфейса мобильного приложения. Проект рассчитан на 2-3 месяца работы.',
    tags: 'Дизайн, UI/UX, Figma',
    deadline: '01.03.2026 - 31.05.2026',
    budget: 150000,
  };

  const onItemClick = (id: number) => {
    if (activeTab === SearchPublicationsType.NEED) {
      setIsNeedDetailsOpen(true);
    } else {
      handleDataNavigation(id, activeTab, publications, searchQuery);
    }
  };

  const handleRespond = () => {
    setIsNeedDetailsOpen(false);
    setIsResponseDrawerOpen(true);
  };

  const handleBackToNeedDetails = () => {
    setIsResponseDrawerOpen(false);
    setIsNeedDetailsOpen(true);
  };

  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      <div className={s.header}>
        <SearchPublications
          activeTab={activeTab}
          initialQuery={queryFromUrl}
          onSearchQueryChange={(query) => setSearchQuery(query)}
        />
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
      <div className={s.content}>
        <ListingContent
          activeTab={activeTab}
          publications={publications}
          isLoading={isLoading}
          isLoaded={searchPublicationStore.isLoaded}
          onItemClick={onItemClick}
        />
      </div>

      <NeedDetailsDrawer
        opened={isNeedDetailsOpen}
        onClose={() => setIsNeedDetailsOpen(false)}
        onRespond={handleRespond}
        needData={mockNeedData}
      />

      <ResponseToNeedDrawer
        opened={isResponseDrawerOpen}
        onClose={() => setIsResponseDrawerOpen(false)}
        onBack={handleBackToNeedDetails}
      />
    </Page>
  );
});

export default MainPage;
