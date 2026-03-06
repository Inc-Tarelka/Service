import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  CreatePublicationRequest,
  PresignRequest,
  PresignResponse,
  Publication,
  PublicationDetailsResponse,
  SearchPublicationsParams,
  SearchPublicationsResponse,
} from './types';

// =========== S3 PRESIGN IMAGE ===========
export const presignImages = async (request: PresignRequest) =>
  (
    await baseInstanceV1.post<PresignResponse>(
      API_URL.generate_url_publication(),
      request,
    )
  ).data;

// =========== CREATE PUBLICATION ===========
export const createPublication = async (request: CreatePublicationRequest) =>
  (await baseInstanceV1.post<Publication>(API_URL.post_publication(), request))
    .data;

// =========== SEARCH PUBLICATION ===========
export const searchPublications = async (
  params?: SearchPublicationsParams,
): Promise<SearchPublicationsResponse> => {
  const response = await baseInstanceV1.get<SearchPublicationsResponse>(
    API_URL.search_publications(),
    { params },
  );
  return response.data;
};

// =========== GET PUBLICATION DETAILS ===========
export const getPublicationDetails = async (id: number) => {
  const response = await baseInstanceV1.get<PublicationDetailsResponse>(
    API_URL.get_publication_details(id.toString()),
  );
  return response.data;
};

// =========== TOGGLE PUBLICATION LIKE ===========
export const togglePublicationLike = async (id: number) => {
  const response = await baseInstanceV1.post(
    API_URL.publication_like(id.toString()),
  );
  return response.data;
};
