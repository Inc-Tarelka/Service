export interface SearchServicesParams {
  cityId?: number;
  name?: string;
  tagIds?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceImage {
  id: number;
  position: number;
  url: string;
}

export interface ServiceTag {
  id: number;
  name: string;
}

export interface ServiceAuthor {
  id: number;
  username: string;
  bio?: string;
  created_at: string;
  education?: string;
  find_work?: string;
  logo_url?: string;
  phone?: string;
  telegram_url?: string;
  tg_user_id?: number;
  type: string;
  wallpaper_url?: string;
}

export interface ServiceNeed {
  id: number;
  name: string;
  description: string;
  budget: number;
  cityId: number;
  deadlineStart: string;
  deadlineEnd: string;
  publicationId: number;
  tags: ServiceTag[];
}

export interface SearchServiceItem {
  id: number;
  name: string;
  description: string;
  images?: ServiceImage[];
  tags: ServiceTag[];
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  createdAt: string;
  type: 'PROJECT' | 'SERVICE';
  authorId: number;
  authorTelegramUrl?: string;
  cityId: number;
  coAuthors: ServiceAuthor[];
  needs: ServiceNeed[];
  topImageUrl: string;
}

export type SearchServicesResponse = SearchServiceItem[];

export interface ErrorResponse {
  error: string;
  message: string;
}
