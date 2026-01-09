import { User } from 'shared/api/service/User/types';

export type InteractionType = 'request' | 'offer';

export interface Interaction {
  id: string;
  type: InteractionType;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  initiator: User;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}
