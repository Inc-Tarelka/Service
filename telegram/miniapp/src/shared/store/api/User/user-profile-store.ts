import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import { getUserById } from 'shared/api/service/User/api';
import { User } from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';

export class UserProfileStore {
  constructor() {
    makeAutoObservable(this);
  }

  userProfileData?: IPromiseBasedObservable<AxiosResponse<User>>;

  getUserProfileAction = async (id: string) => {
    try {
      this.userProfileData = fromPromise<AxiosResponse<User>>(getUserById(id));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  get isLoading() {
    return this.userProfileData?.state === 'pending';
  }

  get profileError() {
    return this.userProfileData?.state === 'rejected'
      ? this.userProfileData.value
      : null;
  }

  get profile(): User | null {
    if (this.userProfileData?.state === 'fulfilled') {
      const apiData = this.userProfileData.value.data;

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
}
