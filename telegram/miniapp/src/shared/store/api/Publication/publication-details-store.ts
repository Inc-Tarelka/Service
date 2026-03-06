import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type { PublicationDetailsResponse } from 'shared/api/service/Publication';
import { getPublicationDetails } from 'shared/api/service/Publication';
import { togglePublicationLike } from 'shared/api/service/Publication/api';

export class PublicationDetailsStore {
  publicationDetailsData?: IPromiseBasedObservable<PublicationDetailsResponse>;

  constructor() {
    makeAutoObservable(this);
  }

  getPublicationDetailsAction = async (id: string | number) => {
    try {
      this.publicationDetailsData = fromPromise<PublicationDetailsResponse>(
        getPublicationDetails(Number(id)),
      );
    } catch (error) {
      console.error('Failed to fetch publication details:', error);
    }
  };

  toggleLikeAction = async (id: number) => {
    try {
      await togglePublicationLike(id);
    } catch (error) {
      console.error('Failed to toggle publication like:', error);
    }
  };

  get isLoading() {
    return this.publicationDetailsData?.state === 'pending';
  }

  get data() {
    return this.publicationDetailsData?.state === 'fulfilled'
      ? this.publicationDetailsData.value
      : null;
  }

  get error() {
    return this.publicationDetailsData?.state === 'rejected'
      ? this.publicationDetailsData.value
      : null;
  }
}
