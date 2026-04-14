import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchNeedItem,
  SearchNeedsParams,
  SearchNeedsResponse,
} from 'shared/api/service/PublicationNeedsSearch';
import { searchNeeds } from 'shared/api/service/PublicationNeedsSearch';

const DEFAULT_NEEDS_LIMIT = 20;

export class SearchNeedsStore {
  searchData?: IPromiseBasedObservable<SearchNeedsResponse>;
  currentParams: SearchNeedsParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchNeedsResponse>>();
  needsList: SearchNeedsResponse = [];
  isLoadingMore = false;
  hasMore = true;
  private requestVersion = 0;

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchNeedsAction = async (params?: SearchNeedsParams): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const normalizedParams: SearchNeedsParams = {
      ...params,
      limit: params?.limit ?? DEFAULT_NEEDS_LIMIT,
      offset: params?.offset ?? 0,
    };
    const limit = normalizedParams.limit ?? DEFAULT_NEEDS_LIMIT;

    try {
      const cacheKey = JSON.stringify(normalizedParams);

      const cached = this.cache.get(cacheKey);

      if (cached?.state === 'fulfilled') {
        this.currentParams = normalizedParams;
        this.searchData = cached;
        const safeNeeds = Array.isArray(cached.value) ? cached.value : [];
        this.needsList = safeNeeds;
        this.isLoadingMore = false;
        this.hasMore = safeNeeds.length >= limit;
        return;
      }

      this.currentParams = normalizedParams;
      this.needsList = [];
      this.isLoadingMore = false;
      this.hasMore = true;

      if (cached?.state === 'pending') {
        this.searchData = cached;
        const cachedNeeds = await cached;
        if (requestVersion !== this.requestVersion) return;
        const safeNeeds = Array.isArray(cachedNeeds) ? cachedNeeds : [];
        this.needsList = safeNeeds;
        this.hasMore = safeNeeds.length >= limit;
        return;
      }

      const promise = fromPromise<SearchNeedsResponse>(
        searchNeeds(normalizedParams),
      );
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
      const needs = await promise;
      if (requestVersion !== this.requestVersion) return;
      const safeNeeds = Array.isArray(needs) ? needs : [];
      this.needsList = safeNeeds;
      this.hasMore = safeNeeds.length >= limit;
    } catch (error) {
      if (requestVersion !== this.requestVersion) return;
      this.needsList = [];
      this.hasMore = false;
      console.error('Failed to search needs:', error);
    }
  };

  loadMoreNeedsAction = async (): Promise<void> => {
    if (this.isLoading || this.isLoadingMore || !this.hasMore) return;

    const limit = this.currentParams.limit ?? DEFAULT_NEEDS_LIMIT;
    const baseOffset = this.currentParams.offset ?? 0;
    const nextParams: SearchNeedsParams = {
      ...this.currentParams,
      limit,
      offset: baseOffset + this.needsList.length,
    };

    this.isLoadingMore = true;

    try {
      const nextNeeds = await searchNeeds(nextParams);
      const safeNextNeeds = Array.isArray(nextNeeds) ? nextNeeds : [];

      if (safeNextNeeds.length === 0) {
        this.hasMore = false;
        return;
      }

      const existingIds = new Set(this.needsList.map((need) => need.id));
      const uniqueNeeds = safeNextNeeds.filter(
        (need: SearchNeedItem) => !existingIds.has(need.id),
      );

      this.needsList = [...this.needsList, ...uniqueNeeds];
      this.hasMore = safeNextNeeds.length >= limit && uniqueNeeds.length > 0;
    } catch (error) {
      console.error('Failed to load more needs:', error);
    } finally {
      this.isLoadingMore = false;
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get needs() {
    return this.needsList;
  }

  get isLoaded() {
    return this.searchData?.state === 'fulfilled';
  }

  get error() {
    return this.searchData?.state === 'rejected' ? this.searchData.value : null;
  }

  reset = (): void => {
    this.requestVersion += 1;
    this.searchData = undefined;
    this.currentParams = {};
    this.needsList = [];
    this.isLoadingMore = false;
    this.hasMore = true;
  };
}
