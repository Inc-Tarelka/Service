import { UserRole } from 'shared/consts/userRoles';

export interface UserStats {
  teammatesCount: number;
  outgoingRequestsCount: number;
  projectsCount: number;
}

export interface PersonData {
  tarelka_user_id: number;
  name: string;
  surname: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Specialization {
  id: number;
  name: string;
}

export interface Direction {
  id: number;
  name: string;
}

export interface Sender {
  id: number;
  name: string;
  surname: string;
}

export type FindWorkStatus = 'LOOKING' | 'NOT_LOOKING' | 'OPEN_TO_OFFERS';

export interface User {
  id: string | number;
  tg_user_id?: number;
  type: 'PERSON' | 'COMPANY';
  username: string;
  phone?: string;
  created_at?: string;

  person?: PersonData;

  bio?: string;
  education?: string;
  find_work?: FindWorkStatus;
  logo_url?: string;
  wallpaper_url?: string;

  cities?: City[];
  specializations?: Specialization[];
  directions?: Direction[];

  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  profession?: string;
  city?: string;
  role?: UserRole;
  stats?: UserStats;
  about?: string;
  tags?: string[];
  status?: string;
  specialization?: string;
  conversation?: number;
  invite_account_type?: string;
  sender?: Sender;
}

export interface DeleteAccountResponse {
  data: string;
  success: boolean;
}

// ===== User media upload types =====

export interface UserMediaPresignRequest {
  contentType: string;
}

export interface UserMediaPresignResponse {
  key: string;
  uploadUrl: string;
  headers: Record<string, string>;
}

export interface UserMediaConfirmRequest {
  key: string;
  mimeType: string;
  size: number;
}

export interface UserLogoConfirmResponse {
  logoUrl: string;
}

export interface UserWallpaperConfirmResponse {
  wallpaperUrl: string;
}

export interface UserMediaUrlRequest {
  logoUrl?: string;
  wallpaperUrl?: string;
}

export interface UserMediaUrlResponse {
  data: string;
  success: boolean;
}

// ===== Teammate =====

export interface Teammate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  specialization: string;
  telegramUrl: string;
}

export type TeammatesResponse = Teammate[];

// ===== Expanded User Profile =====

export interface UserProfilePublication {
  id: number;
  likesCount: number;
  type: 'PROJECT' | 'SERVICE';
  imageUrl?: string;
  isAuthor: boolean;
}

export interface ExpandedUserProfile {
  user: User;
  publications: UserProfilePublication[];
  sender?: Sender;
  teammatesCount: number;
  outgoingRequestsCount: number;
  projectsCount: number;
}
