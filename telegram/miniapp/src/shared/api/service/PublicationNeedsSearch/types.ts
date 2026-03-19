export interface SearchNeedsParams {
  cityId?: number;
  name?: string;
  publicationTagIds?: string;
  needTagIds?: string;
  date?: string;
  budgetMax?: number;
  limit?: number;
  offset?: number;
}

export interface SearchNeedItem {
  id: number;
  name: string;
  description?: string;
  cityName?: string;
  publicationName: string;
  publicationDescription?: string;
}

export type SearchNeedsResponse = SearchNeedItem[];

export interface ErrorResponse {
  error: string;
  message: string;
}
