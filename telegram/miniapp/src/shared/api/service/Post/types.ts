export type PostType = 'project' | 'service';

export interface PostNeed {
  id?: string;
  title: string;
  description: string;
  tagIds?: string[];
  startDate?: Date;
  endDate?: Date;
  budget?: string;
}

export interface PostCollaborator {
  id: string;
  name: string;
  profession: string;
  city: string;
  avatarUrl?: string;
  status: 'confirmed' | 'pending';
}

export interface CreatePostRequest {
  title: string;
  description: string;
  type: PostType;
  tagIds: number[];
  cityId: number;
  images: string[];
  collaboratorIds?: string[];
  needs?: PostNeed[];
}

export interface CreatePostResponse {
  id: string;
  success: boolean;
}

export interface PostTag {
  id: number;
  name: string;
}
