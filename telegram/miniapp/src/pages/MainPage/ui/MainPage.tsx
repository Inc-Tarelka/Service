import { useStore } from 'app/StoreProvider';
import { ResponseToNeedDrawer } from 'features/respond-to-need';
import { SearchPublications } from 'features/search-publications';
import { NeedDetailsDrawer } from 'features/view-need';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchPublicationsType } from 'shared/api/types';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import { TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page/ui/Page';
import { ListingContent } from '../lib/ListingContent';
import { useNavigationLogic } from '../lib/useNavigationLogic';
import s from './MainPage.module.scss';

const TAB_VALUES = new Set(Object.values(SearchPublicationsType));

export const MainPage = observer(() => {
  const {
    searchPublicationStore,
    searchNeedsStore,
    searchServicesStore,
    searchUsersStore,
    searchAllStore,
    scrollRecoveryStore,
  } = useStore();
  const { isDesktop } = useViewport();
  const { handleDataNavigation, handleUserNavigation } = useNavigationLogic();

  const storedTab = scrollRecoveryStore.mainPageActiveTab;
  const initialTab =
    storedTab && TAB_VALUES.has(storedTab as SearchPublicationsType)
      ? (storedTab as SearchPublicationsType)
      : SearchPublicationsType.ALL;

  const navigate = useNavigate();
  const [activeTab, setActiveTabLocal] =
    useState<SearchPublicationsType>(initialTab);
  const [searchQuery, setSearchQueryLocal] = useState(
    scrollRecoveryStore.mainPageSearchQuery,
  );

  const setActiveTab = (tab: SearchPublicationsType) => {
    setActiveTabLocal(tab);
    scrollRecoveryStore.setMainPageActiveTab(tab);
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryLocal(query);
    scrollRecoveryStore.setMainPageSearchQuery(query);
  };
  const [isNeedDetailsOpen, setIsNeedDetailsOpen] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [isResponseDrawerOpen, setIsResponseDrawerOpen] = useState(false);
  const [responseReceiverId, setResponseReceiverId] = useState<number | null>(
    null,
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const [, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const tabs = [
    { label: 'Все', value: SearchPublicationsType.ALL },
    { label: 'Профили', value: SearchPublicationsType.PROFILE },
    { label: 'Услуги', value: SearchPublicationsType.SERVICE },
    { label: 'Потребности', value: SearchPublicationsType.NEED },
  ];
  const getStoreForTab = (tab: SearchPublicationsType) => {
    switch (tab) {
      case SearchPublicationsType.NEED:
        return searchNeedsStore;
      case SearchPublicationsType.SERVICE:
        return searchServicesStore;
      case SearchPublicationsType.PROFILE:
        return searchUsersStore;
      case SearchPublicationsType.ALL:
        return searchAllStore;
      default:
        return searchPublicationStore;
    }
  };

  const publications = searchPublicationStore.publications;
  const needs = searchNeedsStore.needs;
  const services = searchServicesStore.services;
  const users = searchUsersStore.users;
  const allItems = searchAllStore.items;
  const allServices = searchAllStore.services;
  const allNeeds = searchAllStore.needs;
  const allUsers = searchAllStore.users;
  const isUsersLoadingMore = searchUsersStore.isLoadingMore;
  const isServicesLoadingMore = searchServicesStore.isLoadingMore;
  const isNeedsLoadingMore = searchNeedsStore.isLoadingMore;

  const handleItemClickForTab = (id: number, tab: SearchPublicationsType) => {
    switch (tab) {
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
          state: { service: toJS(selectedService) },
        });
        break;
      }
      case SearchPublicationsType.PROFILE:
        handleUserNavigation(id, searchQuery);
        break;
      default:
        handleDataNavigation(id, tab, publications, searchQuery);
    }
  };

  const handleRespond = (receiverId: number | null) => {
    setResponseReceiverId(receiverId);
    setIsNeedDetailsOpen(false);
    setIsResponseDrawerOpen(true);
  };

  const handleBackToNeedDetails = () => {
    setIsResponseDrawerOpen(false);
    setIsNeedDetailsOpen(true);
  };

  const handleTabScrollEnd = (tab: SearchPublicationsType) => {
    switch (tab) {
      case SearchPublicationsType.PROFILE:
        searchUsersStore.loadMoreUsersAction();
        break;
      case SearchPublicationsType.SERVICE:
        searchServicesStore.loadMoreServicesAction();
        break;
      case SearchPublicationsType.NEED:
        searchNeedsStore.loadMoreNeedsAction();
        break;
      default:
        break;
    }
  };

  return (
    <Page
      smallPaddingBottom
      scrollKey={`main-${activeTab}`}
      className={classNames(s.mainPage, {}, [])}
    >
      <div
        ref={headerRef}
        className={classNames(s.header, { [s.desktop]: isDesktop }, [])}
      >
        <SearchPublications
          activeTab={activeTab}
          initialQuery={searchQuery}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
          }}
        />
      </div>
      <TabsSwitcher
        hideMask={true}
        tabs={tabs}
        activeTab={activeTab}
        className={s.tabs}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        stickyTop={64}
        scrollKey="main-tab"
        onSaveScroll={scrollRecoveryStore.setScrollPosition}
        getScroll={scrollRecoveryStore.getScroll}
        onTabScrollEnd={handleTabScrollEnd}
        renderTab={(tab) => {
          const store = getStoreForTab(tab);
          return (
            <ListingContent
              activeTab={tab}
              needs={needs}
              services={services}
              users={users}
              allItems={allItems}
              allServices={allServices}
              allNeeds={allNeeds}
              allUsers={allUsers}
              isLoading={store.isLoading}
              isLoadingMoreProfiles={
                tab === SearchPublicationsType.PROFILE
                  ? isUsersLoadingMore
                  : false
              }
              isLoadingMoreServices={
                tab === SearchPublicationsType.SERVICE
                  ? isServicesLoadingMore
                  : false
              }
              isLoadingMoreNeeds={
                tab === SearchPublicationsType.NEED ? isNeedsLoadingMore : false
              }
              isLoaded={store.isLoaded}
              onAllProfileClick={(id) =>
                handleItemClickForTab(id, SearchPublicationsType.PROFILE)
              }
              onAllServiceClick={(id) =>
                handleItemClickForTab(id, SearchPublicationsType.SERVICE)
              }
              onAllNeedClick={(id) =>
                handleItemClickForTab(id, SearchPublicationsType.NEED)
              }
              onItemClick={(id) => handleItemClickForTab(id, tab)}
            />
          );
        }}
      />

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
        onClose={() => {
          setIsResponseDrawerOpen(false);
          setResponseReceiverId(null);
        }}
        onBack={handleBackToNeedDetails}
        needId={selectedNeedId}
        receiverId={responseReceiverId}
      />
    </Page>
  );
});

export default MainPage;
