import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type {
  SearchByNameParams,
  SearchByNameResponse,
} from 'shared/api/service/Search';
import { searchByName } from 'shared/api/service/Search';

export class SearchStore {
  searchData?: IPromiseBasedObservable<SearchByNameResponse>;
  currentParams: SearchByNameParams = { q: '' };

  constructor() {
    makeAutoObservable(this);
  }

  searchByNameAction = async (params: SearchByNameParams): Promise<void> => {
    try {
      this.currentParams = params;
      this.searchData = fromPromise<SearchByNameResponse>(searchByName(params));
    } catch (error) {
      console.error('Failed to search by name:', error);
    }
  };

  get isLoading() {
    return this.searchData?.state === 'pending';
  }

  get isLoaded() {
    return this.searchData?.state === 'fulfilled';
  }

  get users() {
    return this.searchData?.state === 'fulfilled' ? this.searchData.value : [];
  }

  get error() {
    return this.searchData?.state === 'rejected' ? this.searchData.value : null;
  }

  reset = (): void => {
    this.searchData = undefined;
    this.currentParams = { q: '' };
  };
}
