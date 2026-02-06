import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import { CreatePostRequest, CreatePostResponse, PostTag } from './types';

export const createPostRequest = async (
  data: CreatePostRequest,
): Promise<CreatePostResponse> => {
  const response = await baseInstanceV1.post<CreatePostResponse>(
    API_URL.posts(),
    data,
  );
  return response.data;
};

export const getPostTagsRequest = async (): Promise<PostTag[]> => {
  const response = await baseInstanceV1.get<PostTag[]>(API_URL.post_tags());
  return response.data;
};
