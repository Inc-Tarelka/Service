import { API_URL } from '../../api_url';
import { baseInstanceV1 } from '../../base';
import { DetailsNeedsResponse } from './types';

export const detailsNeedsRequest = async (
  id: string,
): Promise<DetailsNeedsResponse> => {
  const response = await baseInstanceV1.get<DetailsNeedsResponse>(
    API_URL.details_needs(id),
  );
  return response.data;
};
