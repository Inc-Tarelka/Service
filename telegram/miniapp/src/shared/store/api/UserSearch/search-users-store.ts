import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  CoauthorsResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from 'shared/api/service/UserSearch';
import { searchUsers } from 'shared/api/service/UserSearch';
import { searchCoauthors } from 'shared/api/service/UserSearch/api';

export class SearchUsersStore {
  searchData?: IPromiseBasedObservable<SearchUsersResponse>;
  coauthorData?: IPromiseBasedObservable<CoauthorsResponse>;
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

  searchCoauthorsAction = async (params?: SearchUsersParams): Promise<void> => {
    try {
      this.currentParams = params || {};
      this.coauthorData = fromPromise<CoauthorsResponse>(
        searchCoauthors(params),
      );
    } catch (error) {
      console.error('Failed to search coauthors:', error);
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

  get coauthors() {
    return this.coauthorData?.state === 'fulfilled'
      ? this.coauthorData.value
      : [];
  }

  get isCoauthorsLoading() {
    return this.coauthorData?.state === 'pending';
  }

  get coauthorsError() {
    return this.coauthorData?.state === 'rejected'
      ? this.coauthorData.value
      : null;
  }

  reset = (): void => {
    this.searchData = undefined;
    this.coauthorData = undefined;
    this.currentParams = {};
  };
}
