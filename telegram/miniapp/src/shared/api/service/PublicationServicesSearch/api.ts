import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { SearchServicesParams, SearchServicesResponse } from './types';

// =========== SEARCH SERVICES ===========
export const searchServices = async (
  params?: SearchServicesParams,
): Promise<SearchServicesResponse> => {
  const response = await baseInstanceV1.get<SearchServicesResponse>(
    API_URL.search_publication_services(),
    { params },
  );
  return response.data;
};
