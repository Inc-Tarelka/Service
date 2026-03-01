import { UserRole } from 'shared/consts/userRoles';

export interface UserStats {
  collaborations: number;
  wantsToWork: number;
  projects: number;
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
}

export interface DeleteAccountResponse {
  data: string;
  success: boolean;
}
