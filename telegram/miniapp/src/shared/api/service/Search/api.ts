import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { SearchByNameParams, SearchByNameResponse } from './types';

export const searchByName = async (params: SearchByNameParams) => {
  return (
    await baseInstanceV1.get<SearchByNameResponse>(API_URL.search_needs(), {
      params,
    })
  ).data;
};
