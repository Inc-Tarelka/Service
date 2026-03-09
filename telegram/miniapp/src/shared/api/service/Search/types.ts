import type { SearchUser } from 'shared/api/service/UserSearch';

export interface SearchByNameParams {
  q: string;
  limit?: number;
  offset?: number;
}

export type SearchByNameResponse = SearchUser[];
