import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { SearchNeedsParams, SearchNeedsResponse } from './types';

// =========== SEARCH NEEDS ===========
export const searchNeeds = async (
  params?: SearchNeedsParams,
): Promise<SearchNeedsResponse> => {
  const response = await baseInstanceV1.get<SearchNeedsResponse>(
    API_URL.search_publication_needs(),
    { params },
  );
  return response.data;
};
