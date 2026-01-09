import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import { User } from './types';

// =============================== GET PROFILE ===============================
export const getProfile = async () =>
  await baseInstanceV1.get<User>(API_URL.profile());

// =============================== GET USER BY ID ===============================
export const getUserById = async (id: string) =>
  await baseInstanceV1.get<User>(API_URL.user(id));

// =============================== UPDATE PROFILE ===============================
export const updateProfile = async (data: Partial<User>) =>
  await baseInstanceV1.post<User>(API_URL.update_profile(), data);
