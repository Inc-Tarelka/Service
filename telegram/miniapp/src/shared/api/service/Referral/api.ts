import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import type { CreateInviteLinkResponse } from './types';

export const createInviteLinkRequest =
  async (): Promise<CreateInviteLinkResponse> => {
    const response = await baseInstanceV1.get<CreateInviteLinkResponse>(
      API_URL.create_invite_link(),
    );
    return response.data;
  };
