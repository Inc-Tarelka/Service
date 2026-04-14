import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  CoauthorsResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from 'shared/api/service/UserSearch';
import { searchUsers } from 'shared/api/service/UserSearch';
import { searchCoauthors } from 'shared/api/service/UserSearch/api';

const DEFAULT_USERS_LIMIT = 20;

export class SearchUsersStore {
  searchData?: IPromiseBasedObservable<SearchUsersResponse>;
  coauthorData?: IPromiseBasedObservable<CoauthorsResponse>;
  currentParams: SearchUsersParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchUsersResponse>>();
  usersList: SearchUsersResponse = [];
  isLoadingMore = false;
  hasMore = true;
  private requestVersion = 0;

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchUsersAction = async (params?: SearchUsersParams): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const normalizedParams: SearchUsersParams = {
      ...params,
      limit: params?.limit ?? DEFAULT_USERS_LIMIT,
      offset: params?.offset ?? 0,
    };
    const limit = normalizedParams.limit ?? DEFAULT_USERS_LIMIT;

    try {
      const cacheKey = JSON.stringify(normalizedParams);

      const cached = this.cache.get(cacheKey);

      if (cached?.state === 'fulfilled') {
        this.currentParams = normalizedParams;
        this.searchData = cached;
        const safeUsers = Array.isArray(cached.value) ? cached.value : [];
        this.usersList = safeUsers;
        this.isLoadingMore = false;
        this.hasMore = safeUsers.length >= limit;
        return;
      }

      this.currentParams = normalizedParams;
      this.usersList = [];
      this.isLoadingMore = false;
      this.hasMore = true;

      if (cached?.state === 'pending') {
        this.searchData = cached;
        const cachedUsers = await cached;
        if (requestVersion !== this.requestVersion) return;
        const safeUsers = Array.isArray(cachedUsers) ? cachedUsers : [];
        this.usersList = safeUsers;
        this.hasMore = safeUsers.length >= limit;
        return;
      }

      const promise = fromPromise<SearchUsersResponse>(
        searchUsers(normalizedParams),
      );
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
      const users = await promise;
      if (requestVersion !== this.requestVersion) return;
      const safeUsers = Array.isArray(users) ? users : [];
      this.usersList = safeUsers;
      this.hasMore = safeUsers.length >= limit;
    } catch (error) {
      if (requestVersion !== this.requestVersion) return;
      this.usersList = [];
      this.hasMore = false;
      console.error('Failed to search users:', error);
    }
  };

  loadMoreUsersAction = async (): Promise<void> => {
    if (this.isLoading || this.isLoadingMore || !this.hasMore) return;

    const limit = this.currentParams.limit ?? DEFAULT_USERS_LIMIT;
    const baseOffset = this.currentParams.offset ?? 0;
    const nextParams: SearchUsersParams = {
      ...this.currentParams,
      limit,
      offset: baseOffset + this.usersList.length,
    };

    this.isLoadingMore = true;

    try {
      const nextUsers = await searchUsers(nextParams);
      const safeNextUsers = Array.isArray(nextUsers) ? nextUsers : [];

      if (safeNextUsers.length === 0) {
        this.hasMore = false;
        return;
      }

      const existingIds = new Set(this.usersList.map((user) => user.id));
      const uniqueUsers = safeNextUsers.filter(
        (user) => !existingIds.has(user.id),
      );

      this.usersList = [...this.usersList, ...uniqueUsers];
      this.hasMore = safeNextUsers.length >= limit && uniqueUsers.length > 0;
    } catch (error) {
      console.error('Failed to load more users:', error);
    } finally {
      this.isLoadingMore = false;
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
    return this.usersList;
  }

  get isLoaded() {
    return this.searchData?.state === 'fulfilled';
  }

  get error() {
    return this.searchData?.state === 'rejected' ? this.searchData.value : null;
  }

  get coauthors() {
    if (this.coauthorData?.state !== 'fulfilled') return [];
    const value = this.coauthorData.value;
    return Array.isArray(value) ? value : [];
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
    this.requestVersion += 1;
    this.searchData = undefined;
    this.coauthorData = undefined;
    this.currentParams = {};
    this.usersList = [];
    this.isLoadingMore = false;
    this.hasMore = true;
  };
}
