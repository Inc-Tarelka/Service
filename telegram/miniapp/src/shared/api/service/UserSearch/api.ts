import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  CoauthorsResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from './types';

export const searchUsers = async (params?: SearchUsersParams) => {
  return (
    await baseInstanceV1.get<SearchUsersResponse>(API_URL.search_users(), {
      params,
    })
  ).data;
};

export const searchCoauthors = async (params?: SearchUsersParams) => {
  return (
    await baseInstanceV1.get<CoauthorsResponse>(API_URL.search_coauthors(), {
      params,
    })
  ).data;
};
