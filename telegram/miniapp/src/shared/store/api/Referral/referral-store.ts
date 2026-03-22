import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import type { GenerateInviteLinkResponse } from 'shared/api/service/Referral';
import { generateInviteLink } from 'shared/api/service/Referral/api';

export class ReferralStore {
  inviteLinkData?: IPromiseBasedObservable<GenerateInviteLinkResponse>;
  linksCount: number = 5;

  constructor() {
    makeAutoObservable(this);
  }

  generateInviteLinkAction = async (userId: number | string) => {
    try {
      this.inviteLinkData = fromPromise(generateInviteLink(userId));
    } catch (error) {
      console.error('Failed to generate invite link:', error);
    }
  };

  get isLoading() {
    return this.inviteLinkData?.state === 'pending';
  }

  get inviteLink() {
    if (this.inviteLinkData?.state === 'fulfilled') {
      return this.inviteLinkData.value.link;
    }
    return null;
  }
}

export const referralStore = new ReferralStore();
