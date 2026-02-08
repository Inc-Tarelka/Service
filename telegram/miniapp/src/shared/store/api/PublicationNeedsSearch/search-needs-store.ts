import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchNeedsParams,
  SearchNeedsResponse,
} from 'shared/api/service/PublicationNeedsSearch';
import { searchNeeds } from 'shared/api/service/PublicationNeedsSearch';

export class SearchNeedsStore {
  searchData?: IPromiseBasedObservable<SearchNeedsResponse>;
  currentParams: SearchNeedsParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchNeedsResponse>>();

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchNeedsAction = async (params?: SearchNeedsParams): Promise<void> => {
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
      const promise = fromPromise<SearchNeedsResponse>(searchNeeds(params));
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
    } catch (error) {
      console.error('Failed to search needs:', error);
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get needs() {
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
