import { makeAutoObservable } from 'mobx';
import { SearchPublicationsParams } from 'shared/api/service/Publication';
import { SearchNeedsParams } from 'shared/api/service/PublicationNeedsSearch';
import { SearchServicesParams } from 'shared/api/service/PublicationServicesSearch';
import { SearchUsersParams } from 'shared/api/service/UserSearch';
import { SearchPublicationsType } from 'shared/api/types';
import { RootStore } from '../../root-store';

export class SearchInteractionsStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
  }

  performSearch = (
    activeTab: SearchPublicationsType,
    query: string,
    filters: SearchPublicationsParams,
  ) => {
    if (activeTab === SearchPublicationsType.NEED) {
      const needsParams: SearchNeedsParams = {
        name: query,
        cityId: filters.cityId,
        budgetMax: filters.budget,
        date: filters.deadlineStart,
        needTagIds: filters.tagIds?.join(','),
        limit: 20,
        offset: 0,
      };
      this.rootStore.searchNeedsStore.searchNeedsAction(needsParams);
    } else if (activeTab === SearchPublicationsType.SERVICE) {
      const serviceParams: SearchServicesParams = {
        name: query,
        cityId: filters.cityId,
        tagIds: filters.tagIds?.join(','),
        limit: 20,
        offset: 0,
      };
      this.rootStore.searchServicesStore.searchServicesAction(serviceParams);
    } else if (activeTab === SearchPublicationsType.PROFILE) {
      const userParams: SearchUsersParams = {
        name: query,
        cityId: filters.cityId,
        limit: 20,
        offset: 0,
      };
      this.rootStore.searchUsersStore.searchUsersAction(userParams);
    } else {
      const params: SearchPublicationsParams = {
        ...filters,
        query: query,
        limit: 20,
        offset: 0,
      };
      this.rootStore.searchPublicationStore.searchPublicationsAction(params);
    }
  };
}
