export interface SearchUsersParams {
  query?: string;
  cityId?: number;
  specializationId?: number;
  limit?: number;
  offset?: number;
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
  phone?: string;
  logo_url?: string;
  created_at: string;
  person?: Person;
  company?: Company;
  specializations?: Specialization[];
  cities?: City[];
}

export type SearchUsersResponse = SearchUser[];
