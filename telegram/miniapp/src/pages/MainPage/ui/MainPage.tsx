import { useStore } from 'app/StoreProvider';
import { ResponseToNeedDrawer } from 'features/respond-to-need';
import { SearchPublications } from 'features/search-publications';
import { NeedDetailsDrawer } from 'features/view-need';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchPublicationsType } from 'shared/api/types';
import classNames from 'shared/library/ClassNames/classNames';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page/ui/Page';
import { ListingContent } from '../lib/ListingContent';
import { useNavigationLogic } from '../lib/useNavigationLogic';
import s from './MainPage.module.scss';

export const MainPage = observer(() => {
  const {
    searchPublicationStore,
    searchNeedsStore,
    searchServicesStore,
    searchUsersStore,
  } = useStore();
  const [searchParams] = useSearchParams();
  const { handleDataNavigation, handleUserNavigation } = useNavigationLogic();
  const queryFromUrl = searchParams.get('query') || '';
  const tabFromUrl =
    (searchParams.get('tab') as SearchPublicationsType) ||
    SearchPublicationsType.PROFILE;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState<SearchPublicationsType>(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [isNeedDetailsOpen, setIsNeedDetailsOpen] = useState(false);
  const [isResponseDrawerOpen, setIsResponseDrawerOpen] = useState(false);

  const publications = searchPublicationStore.publications;
  const needs = searchNeedsStore.needs;
  const services = searchServicesStore.services;
  const users = searchUsersStore.users;

  const isLoading =
    activeTab === SearchPublicationsType.NEED
      ? searchNeedsStore.isLoading
      : activeTab === SearchPublicationsType.SERVICE
        ? searchServicesStore.isLoading
        : activeTab === SearchPublicationsType.PROFILE
          ? searchUsersStore.isLoading
          : searchPublicationStore.isLoading;

  const isLoaded =
    activeTab === SearchPublicationsType.NEED
      ? searchNeedsStore.isLoaded
      : activeTab === SearchPublicationsType.SERVICE
        ? searchServicesStore.isLoaded
        : activeTab === SearchPublicationsType.PROFILE
          ? searchUsersStore.isLoaded
          : searchPublicationStore.isLoaded;

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
    } else if (activeTab === SearchPublicationsType.SERVICE) {
      const searchState = new URLSearchParams();
      if (searchQuery) searchState.set('query', searchQuery);
      searchState.set('tab', SearchPublicationsType.SERVICE);
      const selectedService =
        services.find((s) => s.id === id) ||
        publications.find((p) => p.id === id);
      navigate(`/service/${id}?${searchState.toString()}`, {
        state: { service: selectedService },
      });
    } else if (activeTab === SearchPublicationsType.PROFILE) {
      handleUserNavigation(id, searchQuery);
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
    <Page
      key={activeTab}
      className={classNames(s.mainPage, {}, [])}
      scrollKey={`main-page-${activeTab}`}
    >
      <div className={s.header}>
        <SearchPublications
          activeTab={activeTab}
          initialQuery={queryFromUrl}
          onSearchQueryChange={(query) => setSearchQuery(query)}
        />
        <TabsSwitcher
          hideMask={true}
          tabs={[
            { label: 'Профили', value: SearchPublicationsType.PROFILE },
            { label: 'Услуги', value: SearchPublicationsType.SERVICE },
            { label: 'Потребности', value: SearchPublicationsType.NEED },
            { label: 'Все', value: SearchPublicationsType.ALL },
          ]}
          activeTab={activeTab}
          className={s.tabs}
          onTabChange={(tab) => setActiveTab(tab as any)}
        />
      </div>
      <div className={s.content}>
        <ListingContent
          activeTab={activeTab}
          needs={needs}
          services={services}
          users={users}
          isLoading={isLoading}
          isLoaded={isLoaded}
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
