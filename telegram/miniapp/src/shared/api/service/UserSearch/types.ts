export interface SearchUsersParams {
  q?: string;
  name?: string;
  cityId?: number;
  specializationIds?: string;
  type?: 'PERSON' | 'COMPANY';
  status?: string;
  limit?: number;
  offset?: number;
}

export interface PersonProfession {
  id: number;
  title: string;
}

export interface PersonCity {
  id: number;
  title: string;
}

export interface Person {
  tarelka_user_id: number;
  name: string;
  surname: string;
}

export interface Company {
  tarelka_user_id: number;
  company_name: string;
}

export interface Specialization {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface SearchUser {
  id: number;
  tg_user_id: number;
  type: 'PERSON' | 'COMPANY';
  username: string;
  telegram_url?: string;
  phone?: string;
  logo_url?: string;
  created_at: string;
  person?: Person;
  company?: Company;
  specializations?: Specialization[];
  cities?: City[];
  projectTopImages?: string[];
}

export type SearchUsersResponse = SearchUser[];

export interface CoauthorSearchUser {
  id: number;
  name: string;
  surname: string;
  telegram_url?: string;
  logo_url?: string;
  city?: {
    id: number;
    name: string;
  };
  specialisation?: string;
}

export type CoauthorsResponse = CoauthorSearchUser[];
