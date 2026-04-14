import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { SearchAllApiResponse, SearchAllParams } from './types';

export const searchAll = async (params?: SearchAllParams) => {
  return (
    await baseInstanceV1.get<SearchAllApiResponse>(API_URL.search_all(), {
      params,
    })
  ).data;
};
