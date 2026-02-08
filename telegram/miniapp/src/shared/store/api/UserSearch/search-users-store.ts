import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchUsersParams,
  SearchUsersResponse,
} from 'shared/api/service/UserSearch';
import { searchUsers } from 'shared/api/service/UserSearch';

export class SearchUsersStore {
  searchData?: IPromiseBasedObservable<SearchUsersResponse>;
  currentParams: SearchUsersParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchUsersResponse>>();

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchUsersAction = async (params?: SearchUsersParams): Promise<void> => {
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
      const promise = fromPromise<SearchUsersResponse>(searchUsers(params));
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get users() {
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
