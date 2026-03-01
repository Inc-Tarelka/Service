import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  deleteAccount,
  getProfile,
  updateProfile,
} from 'shared/api/service/User/api';
import { DeleteAccountResponse, User } from 'shared/api/service/User/types';
import {
  MOCK_INTERACTIONS,
  MOCK_PUBLICATIONS,
  MOCK_USER,
} from 'shared/mocks/profileMocks';

export class UserStore {
  constructor() {
    makeAutoObservable(this);
  }

  profileData?: IPromiseBasedObservable<AxiosResponse<User>>;

  deleteAccountData?: IPromiseBasedObservable<
    AxiosResponse<DeleteAccountResponse>
  >;

  updateProfileData?: IPromiseBasedObservable<AxiosResponse<User>>;

  getProfileAction = async () => {
    try {
      this.profileData = fromPromise<AxiosResponse<User>>(getProfile());
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  deleteAccountAction = async () => {
    try {
      this.deleteAccountData =
        fromPromise<AxiosResponse<DeleteAccountResponse>>(deleteAccount());
      await this.deleteAccountData;
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  updateProfileAction = async (
    data: Partial<User>,
    userId?: number,
  ): Promise<boolean> => {
    try {
      this.updateProfileData = fromPromise<AxiosResponse<User>>(
        updateProfile(data, userId),
      );
      await this.updateProfileData;
      await this.getProfileAction();
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  get isLoadingProfile() {
    return this.profileData?.state === 'pending';
  }

  get isUpdatingProfile() {
    return this.updateProfileData?.state === 'pending';
  }

  get profileError() {
    return this.profileData?.state === 'rejected'
      ? this.profileData.value
      : null;
  }

  get profile(): User | null {
    if (this.profileData?.state === 'fulfilled') {
      const apiData = this.profileData.value.data;

      return {
        ...apiData,
        firstName: apiData.person?.name || MOCK_USER.firstName,
        lastName: apiData.person?.surname || MOCK_USER.lastName,

        avatarUrl: apiData.logo_url,

        about: apiData.bio || MOCK_USER.about,

        city: apiData.cities?.[0]?.name || MOCK_USER.city,

        specialization:
          apiData.specializations?.map((s) => s.name).join(', ') ||
          MOCK_USER.specialization,
        profession: apiData.specializations?.[0]?.name || MOCK_USER.profession,

        status:
          apiData.find_work === 'LOOKING'
            ? 'Ищу работу'
            : apiData.find_work === 'OPEN_TO_OFFERS'
              ? 'Открыт к предложениям'
              : apiData.find_work === 'NOT_LOOKING'
                ? 'Не ищу работу'
                : MOCK_USER.status,

        stats: apiData.stats || MOCK_USER.stats,

        tags: apiData.tags || MOCK_USER.tags,

        role: apiData.role || MOCK_USER.role,
      };
    }
    return null;
  }

  get publications() {
    return MOCK_PUBLICATIONS;
  }
  get interactions() {
    return MOCK_INTERACTIONS;
  }

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
