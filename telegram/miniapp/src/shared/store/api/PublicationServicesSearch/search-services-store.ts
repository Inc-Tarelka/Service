import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchServicesParams,
  SearchServicesResponse,
} from 'shared/api/service/PublicationServicesSearch';
import { searchServices } from 'shared/api/service/PublicationServicesSearch';

export class SearchServicesStore {
  searchData?: IPromiseBasedObservable<SearchServicesResponse>;
  currentParams: SearchServicesParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchServicesResponse>>();

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchServicesAction = async (
    params?: SearchServicesParams,
  ): Promise<void> => {
    try {
      const cacheKey = JSON.stringify(params || {});

      const cached = this.cache.get(cacheKey);
      if (
        cached &&
        (cached.state === 'fulfilled' || cached.state === 'pending')
      ) {
        this.currentParams = params || {};
        this.searchData = cached;
        return;
      }

      this.currentParams = params || {};
      const promise = fromPromise<SearchServicesResponse>(
        searchServices(params),
      );
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
    } catch (error) {
      console.error('Failed to search services:', error);
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get services() {
    return this.searchData?.state === 'fulfilled' ? this.searchData.value : [];
  }

  get isLoaded() {
    return this.searchData?.state === 'fulfilled';
  }

  get error() {
    return this.searchData?.state === 'rejected' ? this.searchData.value : null;
  }

  reset = (): void => {
    this.searchData = undefined;
    this.currentParams = {};
  };
}
