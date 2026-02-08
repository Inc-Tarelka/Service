import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { SearchUsersParams, SearchUsersResponse } from './types';

export const searchUsers = async (params?: SearchUsersParams) => {
  return (
    await baseInstanceV1.get<SearchUsersResponse>(API_URL.search_users(), {
      params,
    })
  ).data;
};
