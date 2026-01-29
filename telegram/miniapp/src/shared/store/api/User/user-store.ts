import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import { deleteAccount, getProfile } from 'shared/api/service/User/api';
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

  get isLoadingProfile() {
    return this.profileData?.state === 'pending';
  }

  get profileError() {
    return this.profileData?.state === 'rejected'
      ? this.profileData.value
      : null;
  }

  // Merge real API data with mock data for missing fields
  get profile(): User | null {
    if (this.profileData?.state === 'fulfilled') {
      const apiData = this.profileData.value.data;

      // Map API data to expected format
      return {
        ...apiData,
        // Map person.name + person.surname to firstName/lastName
        firstName: apiData.person?.name || MOCK_USER.firstName,
        lastName: apiData.person?.surname || MOCK_USER.lastName,

        // Map logo_url to avatarUrl
        avatarUrl: apiData.logo_url,

        // Map bio to about
        about: apiData.bio || MOCK_USER.about,

        // Map cities array to single city string (first city)
        city: apiData.cities?.[0]?.name || MOCK_USER.city,

        // Map specializations array to comma-separated string
        specialization:
          apiData.specializations?.map((s) => s.name).join(', ') ||
          MOCK_USER.specialization,
        profession: apiData.specializations?.[0]?.name || MOCK_USER.profession,

        // Map find_work to status
        status:
          apiData.find_work === 'LOOKING'
            ? 'Ищу работу'
            : apiData.find_work === 'OPEN_TO_OFFERS'
              ? 'Открыт к предложениям'
              : apiData.find_work === 'NOT_LOOKING'
                ? 'Не ищу работу'
                : MOCK_USER.status,

        // Ensure stats exist
        stats: apiData.stats || MOCK_USER.stats,

        // Ensure tags exist
        tags: apiData.tags || MOCK_USER.tags,

        // Role fallback
        role: apiData.role || MOCK_USER.role,
      };
    }
    return null;
  }

  // Return mock publications if needed
  get publications() {
    return MOCK_PUBLICATIONS;
  }

  // Return mock interactions if needed
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
