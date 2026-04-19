import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchPublicationsParams,
  SearchPublicationsResponse,
} from 'shared/api/service/Publication';
import { searchPublications } from 'shared/api/service/Publication';

export class SearchPublicationStore {
  searchData?: IPromiseBasedObservable<SearchPublicationsResponse>;
  currentParams: SearchPublicationsParams = {};
  cache = new Map<
    string,
    IPromiseBasedObservable<SearchPublicationsResponse>
  >();
  private requestVersion = 0;

  constructor() {
    makeAutoObservable(this, {
      cache: false,
    });
  }

  searchPublicationsAction = async (
    params?: SearchPublicationsParams,
  ): Promise<void> => {
    this.requestVersion += 1;
    const version = this.requestVersion;

    try {
      const cacheKey = JSON.stringify(params || {});

      const cached = this.cache.get(cacheKey);
      if (
        cached &&
        (cached.state === 'fulfilled' || cached.state === 'pending')
      ) {
        if (version === this.requestVersion) {
          this.currentParams = params || {};
          this.searchData = cached;
        }
        return;
      }

      this.currentParams = params || {};
      const promise = fromPromise<SearchPublicationsResponse>(
        searchPublications(params),
      );

      if (version === this.requestVersion) {
        this.searchData = promise;
        this.cache.set(cacheKey, promise);
      }
    } catch (error) {
      if (version === this.requestVersion) {
        console.error('Failed to search publications:', error);
      }
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get publications() {
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
    this.cache.clear();
    this.requestVersion += 1;
  };
}
