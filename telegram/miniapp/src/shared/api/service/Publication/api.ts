import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  CreatePublicationCommentRequest,
  CreatePublicationRequest,
  GetPublicationCommentsParams,
  GetPublicationCommentsResponse,
  PresignRequest,
  PresignResponse,
  Publication,
  PublicationComment,
  PublicationDetailsResponse,
  SearchPublicationsParams,
  SearchPublicationsResponse,
  ToggleLikeResponse,
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
export const togglePublicationLike = async (
  id: number,
): Promise<ToggleLikeResponse> => {
  const response = await baseInstanceV1.post<ToggleLikeResponse>(
    API_URL.publication_like(id.toString()),
  );
  return response.data;
};

// =========== COMMENTS ===========
export const getPublicationComments = async (
  publicationId: string | number,
  params?: GetPublicationCommentsParams,
): Promise<GetPublicationCommentsResponse> => {
  const response = await baseInstanceV1.get<GetPublicationCommentsResponse>(
    API_URL.publication_comment(publicationId.toString()),
    { params },
  );
  return response.data;
};

export const createPublicationComment = async (
  publicationId: string | number,
  request: CreatePublicationCommentRequest,
): Promise<PublicationComment> => {
  const response = await baseInstanceV1.post<PublicationComment>(
    API_URL.publication_comment_post(publicationId.toString()),
    request,
  );
  return response.data;
};
