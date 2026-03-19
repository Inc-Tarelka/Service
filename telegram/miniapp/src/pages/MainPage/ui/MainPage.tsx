import { useStore } from 'app/StoreProvider';
import { ResponseToNeedDrawer } from 'features/respond-to-need';
import { SearchPublications } from 'features/search-publications';
import { NeedDetailsDrawer } from 'features/view-need';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchPublicationsType } from 'shared/api/types';
import { useViewport } from 'shared/hooks/useViewport';
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
  const { isDesktop } = useViewport();
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
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [isResponseDrawerOpen, setIsResponseDrawerOpen] = useState(false);

  const tabs = [
    { label: 'Профили', value: SearchPublicationsType.PROFILE },
    { label: 'Услуги', value: SearchPublicationsType.SERVICE },
    { label: 'Потребности', value: SearchPublicationsType.NEED },
    { label: 'Все', value: SearchPublicationsType.ALL },
  ];
  const getActiveStore = () => {
    switch (activeTab) {
      case SearchPublicationsType.NEED:
        return searchNeedsStore;
      case SearchPublicationsType.SERVICE:
        return searchServicesStore;
      case SearchPublicationsType.PROFILE:
        return searchUsersStore;
      default:
        return searchPublicationStore;
    }
  };

  const activeStore = getActiveStore();
  const { isLoading, isLoaded } = activeStore;

  const publications = searchPublicationStore.publications;
  const needs = searchNeedsStore.needs;
  const services = searchServicesStore.services;
  const users = searchUsersStore.users;

  const onItemClick = (id: number) => {
    switch (activeTab) {
      case SearchPublicationsType.NEED:
        setSelectedNeedId(id);
        setIsNeedDetailsOpen(true);
        break;
      case SearchPublicationsType.SERVICE: {
        const searchState = new URLSearchParams();
        if (searchQuery) searchState.set('query', searchQuery);
        searchState.set('tab', SearchPublicationsType.SERVICE);
        const selectedService =
          services.find((s) => s.id === id) ||
          publications.find((p) => p.id === id);
        navigate(`/service/${id}?${searchState.toString()}`, {
          state: { service: selectedService },
        });
        break;
      }
      case SearchPublicationsType.PROFILE:
        handleUserNavigation(id, searchQuery);
        break;
      default:
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
      <div className={classNames(s.header, { [s.desktop]: isDesktop }, [])}>
        <SearchPublications
          activeTab={activeTab}
          initialQuery={queryFromUrl}
          onSearchQueryChange={(query) => setSearchQuery(query)}
        />
        <TabsSwitcher
          hideMask={true}
          tabs={tabs}
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
        onClose={() => {
          setIsNeedDetailsOpen(false);
          setTimeout(() => setSelectedNeedId(null), 300);
        }}
        onRespond={handleRespond}
        needId={selectedNeedId}
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
