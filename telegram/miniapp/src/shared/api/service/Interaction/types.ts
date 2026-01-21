export interface Interaction {
  id: string;
  type: 'offer' | 'collaboration';
  description: string;
  comment?: string;
  projectName?: string;

  initiator: {
    avatarUrl: string;
    firstName: string;
    lastName: string;
    username: string;
    profession?: string;
    city?: string;
  };

  // For collaboration requests
  projectDetails?: {
    title: string;
    description: string;
    imageUrl?: string;
  };

  // For offers
  needDetails?: {
    title: string;
    description: string;
  };

  serviceDetails?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
}
