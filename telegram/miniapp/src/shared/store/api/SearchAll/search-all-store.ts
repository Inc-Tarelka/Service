import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import type {
  SearchAllApiResponse,
  SearchAllParams,
  SearchAllResponse,
} from 'shared/api/service/SearchAll';
import { searchAll } from 'shared/api/service/SearchAll';
import type { SearchUser } from 'shared/api/service/UserSearch';
import {
  mapSearchAllApiResponseToItems,
  mapSearchAllApiResponseToNeeds,
  mapSearchAllApiResponseToServices,
  mapSearchAllApiResponseToUsers,
} from 'shared/api/service/SearchAll/types';

const DEFAULT_LIMIT = 20;

export class SearchAllStore {
  searchData?: IPromiseBasedObservable<SearchAllApiResponse>;
  currentParams: SearchAllParams = {};
  itemsList: SearchAllResponse = [];
  servicesList: SearchServiceItem[] = [];
  needsList: SearchNeedItem[] = [];
  usersList: SearchUser[] = [];
  private requestVersion = 0;
  private cache = new Map<string, SearchAllApiResponse>();

  constructor() {
    makeAutoObservable(this);
  }

  searchAllAction = async (params?: SearchAllParams): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const normalizedParams: SearchAllParams = {
      ...params,
      limit: params?.limit ?? DEFAULT_LIMIT,
      offset: 0,
    };

    const cacheKey = JSON.stringify(normalizedParams);

    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey)!;
      this.itemsList = mapSearchAllApiResponseToItems(cachedData);
      this.servicesList = mapSearchAllApiResponseToServices(cachedData);
      this.needsList = mapSearchAllApiResponseToNeeds(cachedData);
      this.usersList = mapSearchAllApiResponseToUsers(cachedData);
      this.searchData = fromPromise.resolve(cachedData);
      return;
    }

    try {
      this.currentParams = normalizedParams;
      this.itemsList = [];
      this.servicesList = [];
      this.needsList = [];
      this.usersList = [];

      const promise = fromPromise<SearchAllApiResponse>(
        searchAll(normalizedParams),
      );
      this.searchData = promise;
      const response = await promise;

      if (requestVersion !== this.requestVersion) return;

      this.cache.set(cacheKey, response);

      this.itemsList = mapSearchAllApiResponseToItems(response);
      this.servicesList = mapSearchAllApiResponseToServices(response);
      this.needsList = mapSearchAllApiResponseToNeeds(response);
      this.usersList = mapSearchAllApiResponseToUsers(response);
    } catch (error) {
      if (requestVersion !== this.requestVersion) return;
      this.itemsList = [];
      this.servicesList = [];
      this.needsList = [];
      this.usersList = [];
      console.error('Failed to search all entities:', error);
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get isLoaded() {
    return this.searchData?.state === 'fulfilled';
  }

  get items() {
    return this.itemsList;
  }

  get services() {
    return this.servicesList;
  }

  get needs() {
    return this.needsList;
  }

  get users() {
    return this.usersList;
  }

  get error() {
    return this.searchData?.state === 'rejected' ? this.searchData.value : null;
  }

  reset = (): void => {
    this.requestVersion += 1;
    this.searchData = undefined;
    this.currentParams = {};
    this.itemsList = [];
    this.servicesList = [];
    this.needsList = [];
    this.usersList = [];
    this.cache.clear();
  };
}
