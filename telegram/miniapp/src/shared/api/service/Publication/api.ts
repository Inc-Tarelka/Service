import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type {
  CreatePublicationRequest,
  PresignRequest,
  PresignResponse,
  Publication,
} from './types';

/**
 * Request presigned URLs for uploading images to S3
 */
export const presignImages = async (request: PresignRequest) =>
  (
    await baseInstanceV1.post<PresignResponse>(
      API_URL.generate_url_publication(),
      request,
    )
  ).data;

/**
 * Create a new publication
 */
export const createPublication = async (request: CreatePublicationRequest) =>
  (await baseInstanceV1.post<Publication>(API_URL.post_publication(), request))
    .data;
