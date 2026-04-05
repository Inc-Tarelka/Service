export interface PresignFileRequest {
  contentType: string;
}

export interface PresignRequest {
  files: PresignFileRequest[];
}

export interface PresignItem {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  headers: {
    'Content-Type': string;
  };
}

export interface PresignResponse {
  items: PresignItem[];
}

export interface PublicationNeed {
  name: string;
  description?: string;
  budget?: number;
  deadlineStart?: string;
  deadlineEnd?: string;
  cityId?: number;
  tagIds?: number[];
}

export interface CreatePublicationRequest {
  name: string;
  type: 'PROJECT' | 'SERVICE';
  description?: string;
  imageUrls?: string[];
  cityId?: number;
  tagIds?: number[];
  coAuthorIds?: number[];
  needs?: PublicationNeed[];
}

export interface UpdatePublicationRequest {
  name?: string;
  type?: 'PROJECT' | 'SERVICE';
  description?: string;
  imageUrls?: string[];
  cityId?: number;
  tagIds?: number[];
  coAuthorIds?: number[];
  needs?: PublicationNeed[];
  isHidden?: boolean;
}

export interface Publication {
  id: number;
  name: string;
  type: 'PROJECT' | 'SERVICE';
  description?: string;
  imageUrls: string[];
  cityId?: number;
  tagIds?: number[];
  coAuthorIds?: number[];
  needs?: PublicationNeed[];
  createdAt: string;
  updatedAt: string;
}

export type WorkingStatus = 'LOOKING' | 'NOT_LOOKING' | 'OPEN_TO_OFFERS';

export interface SearchPublicationsParams {
  query?: string;
  type?: 'PROJECT' | 'SERVICE';
  authorType?: 'PERSON' | 'COMPANY';
  cityId?: number;
  workingStatus?: WorkingStatus;
  specializationId?: number;
  tagIds?: number[];
  deadlineStart?: string;
  deadlineEnd?: string;
  budget?: number;
  limit?: number;
  offset?: number;
}

export interface AnimeGenreImage {
  url: string;
}

export interface AnimeGenre {
  id: number;
  name: string;
  image: AnimeGenreImage;
  total_releases: number;
}

export interface CoAuthor {
  id: number;
  username: string;
  bio?: string;
  education?: string;
  phone?: string;
  logo_url?: string;
  wallpaper_url?: string;
  telegram_url?: string;
  type: string;
  find_work?: WorkingStatus;
  tg_user_id?: number;
  created_at: string;
}

export interface PublicationImage {
  id: number;
  url: string;
  position: number;
}

export interface PublicationTag {
  id: number;
  name: string;
}

export interface PublicationNeedDetailed {
  id: number;
  name: string;
  description?: string;
  budget?: number;
  cityId?: number;
  deadlineStart?: string;
  deadlineEnd?: string;
  publicationId: number;
  tags: PublicationTag[];
}

export interface SearchPublication {
  id: number;
  name: string;
  description?: string;
  type: 'PROJECT' | 'SERVICE';
  authorId: number;
  cityId?: number;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  coAuthors: CoAuthor[];
  images: PublicationImage[];
  tags: PublicationTag[];
  needs: PublicationNeedDetailed[];
}

export interface ToggleLikeResponse {
  isLiked: boolean;
  success: boolean;
}

export type SearchPublicationsResponse = SearchPublication[];

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface PublicationTeamMember {
  avatarUrl: string;
  cityName: string;
  firstName: string;
  isAuthor: boolean;
  lastName: string;
  specialization: string;
  userId: number;
}

export interface PublicationDetailsData extends SearchPublication {
  authorFirstName?: string;
  authorLastName?: string;
  authorTelegramUrl?: string;
  commentsCount?: number;
  topImageUrl?: string;
}

export interface PublicationDetailsResponse {
  needs: PublicationNeedDetailed[];
  publication: PublicationDetailsData;
  team: PublicationTeamMember[];
}

export interface PublicationComment {
  id: number;
  authorId: number;
  authorFirstName?: string;
  authorLastName?: string;
  authorOrgName?: string;
  content: string;
  createdAt: string;
  parentCommentId?: number;
}

export interface GetPublicationCommentsResponse {
  comments: PublicationComment[];
  total: number;
}

export interface CreatePublicationCommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface GetPublicationCommentsParams {
  limit?: number;
  offset?: number;
}

export interface MyProject {
  description: string;
  id: number;
  image: string | null;
  isAuthor: boolean;
  likesCount: number;
  name: string;
  type: 'PROJECT';
}
