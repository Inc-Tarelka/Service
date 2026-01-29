import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import { deleteAccount } from 'shared/api/service/User/api';
import { DeleteAccountResponse } from 'shared/api/service/User/types';

export class UserStore {
  constructor() {
    makeAutoObservable(this);
  }

  deleteAccountData?: IPromiseBasedObservable<
    AxiosResponse<DeleteAccountResponse>
  >;

  deleteAccountAction = async () => {
    try {
      this.deleteAccountData =
        fromPromise<AxiosResponse<DeleteAccountResponse>>(deleteAccount());
      await this.deleteAccountData;
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  get isDeleting() {
    return this.deleteAccountData?.state === 'pending';
  }

  get isDeleted() {
    return (
      this.deleteAccountData?.state === 'fulfilled' &&
      this.deleteAccountData.value.data.success
    );
  }
}
