import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  deleteAccount,
  getMyExtendedProfile,
  getMyTeammates,
  getProfile,
  updateProfile,
} from 'shared/api/service/User/api';
import {
  DeleteAccountResponse,
  ExpandedUserProfile,
  Teammate,
  User,
} from 'shared/api/service/User/types';
import { MOCK_INTERACTIONS, MOCK_USER } from 'shared/mocks/profileMocks';

export class UserStore {
  constructor() {
    makeAutoObservable(this);
  }

  profileData?: IPromiseBasedObservable<AxiosResponse<User>>;
  myExtendedProfileData?: IPromiseBasedObservable<
    AxiosResponse<ExpandedUserProfile>
  >;
  _localOverrides: Partial<User> = {};

  teammatesData?: IPromiseBasedObservable<AxiosResponse<Teammate[]>>;

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

  getMyExtendedProfileAction = async () => {
    try {
      this.myExtendedProfileData = fromPromise<
        AxiosResponse<ExpandedUserProfile>
      >(getMyExtendedProfile());
    } catch (error) {
      console.error('Failed to fetch my extended profile:', error);
    }
  };

  getTeammatesAction = async () => {
    try {
      this.teammatesData =
        fromPromise<AxiosResponse<Teammate[]>>(getMyTeammates());
    } catch (error) {
      console.error('Failed to fetch teammates:', error);
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

  setLocalOverride = (overrides: Partial<User>) => {
    const normalized = { ...overrides };
    const cacheBuster = `?v=${Date.now()}`;
    if (normalized.avatarUrl) {
      normalized.avatarUrl = normalized.avatarUrl.split('?')[0] + cacheBuster;
    }
    if (normalized.logo_url) {
      normalized.logo_url = normalized.logo_url.split('?')[0] + cacheBuster;
    }
    this._localOverrides = { ...this._localOverrides, ...normalized };
  };

  clearLocalOverrides = () => {
    this._localOverrides = {};
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
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  get isLoadingProfile() {
    return (
      this.profileData?.state === 'pending' ||
      this.myExtendedProfileData?.state === 'pending'
    );
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
    const extendedData =
      this.myExtendedProfileData?.state === 'fulfilled'
        ? this.myExtendedProfileData.value.data
        : null;

    const apiData: User | null =
      this.profileData?.state === 'fulfilled'
        ? this.profileData.value.data
        : extendedData
          ? extendedData.user
          : null;

    if (apiData) {
      const computed: User = {
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

        stats: extendedData
          ? {
              teammatesCount: extendedData.teammatesCount ?? 0,
              outgoingRequestsCount: extendedData.outgoingRequestsCount ?? 0,
              projectsCount: extendedData.projectsCount ?? 0,
            }
          : apiData.stats || MOCK_USER.stats,

        tags: apiData.tags || MOCK_USER.tags,
        role: apiData.role || MOCK_USER.role,
      };

      return { ...computed, ...this._localOverrides };
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

  get publications() {
    if (this.myExtendedProfileData?.state === 'fulfilled') {
      return this.myExtendedProfileData.value.data.publications;
    }
    return [];
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
