import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchServiceItem,
  SearchServicesParams,
  SearchServicesResponse,
} from 'shared/api/service/PublicationServicesSearch';
import { searchServices } from 'shared/api/service/PublicationServicesSearch';

const DEFAULT_SERVICES_LIMIT = 20;

export class SearchServicesStore {
  searchData?: IPromiseBasedObservable<SearchServicesResponse>;
  currentParams: SearchServicesParams = {};
  cache = new Map<string, IPromiseBasedObservable<SearchServicesResponse>>();
  servicesList: SearchServicesResponse = [];
  isLoadingMore = false;
  hasMore = true;
  private requestVersion = 0;

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchServicesAction = async (
    params?: SearchServicesParams,
  ): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const normalizedParams: SearchServicesParams = {
      ...params,
      limit: params?.limit ?? DEFAULT_SERVICES_LIMIT,
      offset: params?.offset ?? 0,
    };
    const limit = normalizedParams.limit ?? DEFAULT_SERVICES_LIMIT;

    try {
      const cacheKey = JSON.stringify(normalizedParams);

      const cached = this.cache.get(cacheKey);

      if (cached?.state === 'fulfilled') {
        this.currentParams = normalizedParams;
        this.searchData = cached;
        const safeServices = Array.isArray(cached.value) ? cached.value : [];
        this.servicesList = safeServices;
        this.isLoadingMore = false;
        this.hasMore = safeServices.length >= limit;
        return;
      }

      this.currentParams = normalizedParams;
      this.servicesList = [];
      this.isLoadingMore = false;
      this.hasMore = true;

      if (cached?.state === 'pending') {
        this.searchData = cached;
        const cachedServices = await cached;
        if (requestVersion !== this.requestVersion) return;
        const safeServices = Array.isArray(cachedServices)
          ? cachedServices
          : [];
        this.servicesList = safeServices;
        this.hasMore = safeServices.length >= limit;
        return;
      }

      const promise = fromPromise<SearchServicesResponse>(
        searchServices(normalizedParams),
      );
      this.searchData = promise;
      this.cache.set(cacheKey, promise);
      const services = await promise;
      if (requestVersion !== this.requestVersion) return;
      const safeServices = Array.isArray(services) ? services : [];
      this.servicesList = safeServices;
      this.hasMore = safeServices.length >= limit;
    } catch (error) {
      if (requestVersion !== this.requestVersion) return;
      this.servicesList = [];
      this.hasMore = false;
      console.error('Failed to search services:', error);
    }
  };

  loadMoreServicesAction = async (): Promise<void> => {
    if (this.isLoading || this.isLoadingMore || !this.hasMore) return;

    const limit = this.currentParams.limit ?? DEFAULT_SERVICES_LIMIT;
    const baseOffset = this.currentParams.offset ?? 0;
    const nextParams: SearchServicesParams = {
      ...this.currentParams,
      limit,
      offset: baseOffset + this.servicesList.length,
    };

    this.isLoadingMore = true;

    try {
      const nextServices = await searchServices(nextParams);
      const safeNextServices = Array.isArray(nextServices) ? nextServices : [];

      if (safeNextServices.length === 0) {
        this.hasMore = false;
        return;
      }

      const existingIds = new Set(
        this.servicesList.map((service) => service.id),
      );
      const uniqueServices = safeNextServices.filter(
        (service: SearchServiceItem) => !existingIds.has(service.id),
      );

      this.servicesList = [...this.servicesList, ...uniqueServices];
      this.hasMore =
        safeNextServices.length >= limit && uniqueServices.length > 0;
    } catch (error) {
      console.error('Failed to load more services:', error);
    } finally {
      this.isLoadingMore = false;
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get services() {
    return this.servicesList;
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
    this.servicesList = [];
    this.isLoadingMore = false;
    this.hasMore = true;
  };
}
