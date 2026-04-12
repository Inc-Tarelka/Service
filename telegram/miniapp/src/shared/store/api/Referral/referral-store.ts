import { AxiosError } from 'axios';
import { makeAutoObservable, runInAction } from 'mobx';
import { createInviteLinkRequest } from 'shared/api/service/Referral/api';
import { TELEGRAM_BOT_BASE_URL } from 'shared/lib/utils/telegram-startapp';

export class ReferralStore {
  senderId: string | null = null;
  isLoading = false;
  isLimitReached = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get inviteLink(): string | null {
    if (!this.senderId) return null;
    return `${TELEGRAM_BOT_BASE_URL}?startapp=${this.senderId}`;
  }

  generateInviteLinkAction = async () => {
    if (this.isLoading) return;

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await createInviteLinkRequest();
      runInAction(() => {
        this.senderId = response.senderId;
        this.isLimitReached = false;
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const errorCode = axiosErr.response?.data?.error;

      runInAction(() => {
        if (
          axiosErr.response?.status === 403 &&
          errorCode === 'invite_limit_reached'
        ) {
          this.isLimitReached = true;
        } else {
          this.error = 'Не удалось создать ссылку. Попробуйте позже.';
        }
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  reset = () => {
    this.senderId = null;
    this.isLoading = false;
    this.isLimitReached = false;
    this.error = null;
  };
}

export const referralStore = new ReferralStore();
