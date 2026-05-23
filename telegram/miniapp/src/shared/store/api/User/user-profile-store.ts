import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  getUserById,
  getUserExtendedProfile,
  getUserTeammates,
} from 'shared/api/service/User/api';
import {
  ExpandedUserProfile,
  Teammate,
  User,
} from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';

export class UserProfileStore {
  constructor() {
    makeAutoObservable(this);
  }

  userProfileData?: IPromiseBasedObservable<AxiosResponse<User>>;
  userExtendedProfileData?: IPromiseBasedObservable<
    AxiosResponse<ExpandedUserProfile>
  >;

  teammatesData?: IPromiseBasedObservable<AxiosResponse<Teammate[]>>;

  getUserProfileAction = async (id: string) => {
    try {
      this.userProfileData = fromPromise<AxiosResponse<User>>(getUserById(id));
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  getUserExtendedProfileAction = async (id: string) => {
    try {
      this.userExtendedProfileData = fromPromise<
        AxiosResponse<ExpandedUserProfile>
      >(getUserExtendedProfile(id));
    } catch (error) {
      console.error('Failed to fetch user extended profile:', error);
    }
  };

  getTeammatesAction = async (id: string) => {
    try {
      this.teammatesData = fromPromise<AxiosResponse<Teammate[]>>(
        getUserTeammates(id),
      );
    } catch (error) {
      console.error('Failed to fetch user teammates:', error);
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

  get isExtendedLoading() {
    return this.userExtendedProfileData?.state === 'pending';
  }

  get extendedProfileError() {
    return this.userExtendedProfileData?.state === 'rejected'
      ? this.userExtendedProfileData.value
      : null;
  }

  get extendedProfile(): ExpandedUserProfile | null {
    if (this.userExtendedProfileData?.state === 'fulfilled') {
      return this.userExtendedProfileData.value.data;
    }
    return null;
  }

  get profile(): User | null {
    const isExtended = this.userExtendedProfileData?.state === 'fulfilled';
    const extendedData = isExtended
      ? (
          this.userExtendedProfileData!
            .value as AxiosResponse<ExpandedUserProfile>
        ).data
      : null;

    const apiData: User | null =
      this.userProfileData?.state === 'fulfilled'
        ? (this.userProfileData.value as AxiosResponse<User>).data
        : isExtended && extendedData
          ? extendedData.user
          : null;

    if (apiData) {
      return {
        ...apiData,
        firstName: apiData.person?.name || MOCK_USER.firstName,
        lastName: apiData.person?.surname || MOCK_USER.lastName,

        avatarUrl: apiData.logo_url || apiData.avatarUrl,

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

        stats: extendedData
          ? {
              teammatesCount: extendedData.teammatesCount ?? 0,
              outgoingRequestsCount: extendedData.outgoingRequestsCount ?? 0,
              projectsCount: extendedData.projectsCount ?? 0,
            }
          : apiData.stats || MOCK_USER.stats,

        tags: apiData.tags || MOCK_USER.tags,

        role: apiData.role || MOCK_USER.role,
        master:
          apiData.master || extendedData?.user?.master || extendedData?.master,
      };
    }
    return null;
  }

  get teammates(): Teammate[] {
    return this.teammatesData?.state === 'fulfilled'
      ? this.teammatesData.value.data
      : [];
  }

  get isLoadingTeammates() {
    return this.teammatesData?.state === 'pending';
  }
}
