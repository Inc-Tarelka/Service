import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  DeleteAccountResponse,
  ExpandedUserProfile,
  TeammatesResponse,
  UpdateMyProfileRequest,
  User,
  UserLogoConfirmResponse,
  UserMediaConfirmRequest,
  UserMediaPresignRequest,
  UserMediaPresignResponse,
  UserMediaUrlResponse,
  UserWallpaperConfirmResponse,
} from './types';

// =============================== GET PROFILE ===============================
export const getProfile = async () =>
  await baseInstanceV1.get<User>(API_URL.profile());

// =============================== GET USER BY ID ===============================
export const getUserById = async (id: string) =>
  await baseInstanceV1.get<User>(API_URL.user(id));

// =============================== UPDATE PROFILE ===============================
export const updateProfile = async (data: Partial<User>, userId?: number) =>
  await baseInstanceV1.patch<User>(
    userId ? API_URL.user(userId) : API_URL.profile(),
    data,
  );

export const updateMyProfile = async (data: UpdateMyProfileRequest) =>
  await baseInstanceV1.patch<User>(API_URL.me_profile(), data);

// =============================== DELETE ACCOUNT ===============================
export const deleteAccount = async () =>
  await baseInstanceV1.delete<DeleteAccountResponse>(API_URL.delete_account());

// =============================== LOGO PRESIGN ===============================
export const presignUserLogo = async (
  id: number,
  request: UserMediaPresignRequest,
) =>
  (
    await baseInstanceV1.post<UserMediaPresignResponse>(
      API_URL.user_logo_presign(id),
      request,
    )
  ).data;

// =============================== LOGO CONFIRM ===============================
export const confirmUserLogo = async (
  id: number,
  request: UserMediaConfirmRequest,
) =>
  (
    await baseInstanceV1.post<UserLogoConfirmResponse>(
      API_URL.user_logo_confirm(id),
      request,
    )
  ).data;

// =============================== LOGO EXTERNAL URL ===============================
export const setUserLogoUrl = async (id: number, logoUrl: string) =>
  (
    await baseInstanceV1.post<UserMediaUrlResponse>(API_URL.user_logo_url(id), {
      logoUrl,
    })
  ).data;

// =============================== WALLPAPER PRESIGN ===============================
export const presignUserWallpaper = async (
  id: number,
  request: UserMediaPresignRequest,
) =>
  (
    await baseInstanceV1.post<UserMediaPresignResponse>(
      API_URL.user_wallpaper_presign(id),
      request,
    )
  ).data;

// =============================== WALLPAPER CONFIRM ===============================
export const confirmUserWallpaper = async (
  id: number,
  request: UserMediaConfirmRequest,
) =>
  (
    await baseInstanceV1.post<UserWallpaperConfirmResponse>(
      API_URL.user_wallpaper_confirm(id),
      request,
    )
  ).data;

// =============================== WALLPAPER EXTERNAL URL ===============================
export const setUserWallpaperUrl = async (id: number, wallpaperUrl: string) =>
  (
    await baseInstanceV1.post<UserMediaUrlResponse>(
      API_URL.user_wallpaper_url(id),
      { wallpaperUrl },
    )
  ).data;

// =============================== EXTENDED PROFILE ===============================
export const getUserExtendedProfile = async (id: string) =>
  await baseInstanceV1.get<ExpandedUserProfile>(API_URL.user_profile(id));

// =============================== MY EXTENDED PROFILE ===============================
export const getMyExtendedProfile = async () =>
  await baseInstanceV1.get<ExpandedUserProfile>(API_URL.me_profile());

// =============================== MY TEAMMATES ===============================
export const getMyTeammates = async () =>
  await baseInstanceV1.get<TeammatesResponse>(API_URL.me_teammates());
