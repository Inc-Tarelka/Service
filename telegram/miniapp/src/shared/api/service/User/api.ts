import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import { DeleteAccountResponse, User } from './types';

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

// =============================== DELETE ACCOUNT ===============================
export const deleteAccount = async () =>
  await baseInstanceV1.delete<DeleteAccountResponse>(API_URL.delete_account());
