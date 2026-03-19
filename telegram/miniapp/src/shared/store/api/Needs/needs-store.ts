import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type { DetailsNeedsResponse } from 'shared/api/service/Needs';
import { detailsNeedsRequest } from 'shared/api/service/Needs';
export class NeedsStore {
  constructor() {
    makeAutoObservable(this);
  }

  needDetailsDataMap = new Map<
    string,
    IPromiseBasedObservable<DetailsNeedsResponse>
  >();

  getNeedDetailsAction = async (id: string) => {
    if (this.needDetailsDataMap.has(id)) {
      return;
    }

    try {
      const promise = fromPromise<DetailsNeedsResponse>(
        detailsNeedsRequest(id),
      );
      this.needDetailsDataMap.set(id, promise);
    } catch (error) {
      console.error('Failed to fetch need details:', error);
    }
  };

  isLoadingDetails = (id: string) => {
    const request = this.needDetailsDataMap.get(id);
    return request?.state === 'pending';
  };

  needDetails = (id: string) => {
    const request = this.needDetailsDataMap.get(id);
    return request?.state === 'fulfilled' ? request.value : null;
  };
}
