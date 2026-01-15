export interface City {
  id: number;
  name: string;
}

export interface Direction {
  id: number;
  name: string;
}

export interface Specialization {
  id: number;
  name: string;
}

export enum AccountType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

export interface TarelkaPerson {
  name?: string;
  surname?: string;
  tarelka_user_id?: number;
}

export interface TarelkaCompany {
  company_name?: string;
  tarelka_user_id?: number;
}

export interface TarelkaUserFull {
  id: number;
  username?: string;
  phone?: string;
  type?: AccountType;
  logo_url?: string;
  telegram_url?: string;
  created_at?: string;
  tg_user_id?: number;
  person?: TarelkaPerson;
  company?: TarelkaCompany;
  cities?: City[];
  directions?: Direction[];
  specializations?: Specialization[];
}

export interface ErrorResponse {
  error?: string;
  message?: string;
}

export interface SuccessResponse {
  success?: boolean;
  data?: any;
}
