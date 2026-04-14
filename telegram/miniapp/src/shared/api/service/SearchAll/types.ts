import type { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import type { SearchUser } from 'shared/api/service/UserSearch';

export interface SearchAllParams {
  q?: string;
  limit?: number;
  offset?: number;
}

export type SearchAllEntityType = 'service' | 'need' | 'profile';

export interface SearchAllItem {
  id: number;
  type: SearchAllEntityType;
  title: string;
  description?: string;
  logoUrl?: string;
  cityName?: string;
  username?: string;
  telegram_url?: string;
}

export type SearchAllResponse = SearchAllItem[];

export interface SearchAllServiceRaw {
  id: number;
  authorId?: number;
  name?: string;
  description?: string;
  type?: 'PROJECT' | 'SERVICE' | string;
  cityId?: number;
  tags?: SearchServiceItem['tags'] | null;
  coAuthors?: SearchServiceItem['coAuthors'] | null;
  needs?: SearchServiceItem['needs'] | null;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  topImageUrl?: string | null;
  authorTelegramUrl?: string | null;
}

export interface SearchAllNeedRaw {
  id: number;
  name?: string;
  description?: string;
  publicationName?: string;
  publicationDescription?: string;
  cityName?: string;
}

export interface SearchAllUserRaw extends Partial<SearchUser> {
  id: number;
  username?: string;
  type?: SearchUser['type'];
  tg_user_id?: number;
  created_at?: string;
}

export interface SearchAllGroupedResponse {
  services?: SearchAllServiceRaw[];
  needs?: SearchAllNeedRaw[];
  users?: SearchAllUserRaw[];
}

export type SearchAllApiResponse = SearchAllResponse | SearchAllGroupedResponse;

const normalizeTelegramUrl = (value?: string | null): string | undefined => {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith('@')) {
    return normalized;
  }

  const telegramLinkMatch = normalized.match(/^https?:\/\/t\.me\/(.+)$/i);
  if (telegramLinkMatch?.[1]) {
    return `@${telegramLinkMatch[1]}`;
  }

  return normalized.startsWith('http') ? normalized : `@${normalized}`;
};

const mapFlatServices = (items: SearchAllResponse): SearchServiceItem[] =>
  items
    .filter((item) => item.type === 'service')
    .map((item) => ({
      id: item.id,
      name: item.title,
      description: item.description ?? '',
      images: [],
      tags: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: '',
      type: 'SERVICE',
      authorId: 0,
      authorTelegramUrl: item.telegram_url,
      cityId: 0,
      coAuthors: [],
      needs: [],
      topImageUrl: item.logoUrl ?? '',
    }));

const mapFlatNeeds = (items: SearchAllResponse): SearchNeedItem[] =>
  items
    .filter((item) => item.type === 'need')
    .map((item) => ({
      id: item.id,
      name: item.title,
      description: item.description,
      publicationName: item.title,
      publicationDescription: item.description,
      cityName: item.cityName,
    }));

const mapFlatUsers = (items: SearchAllResponse): SearchUser[] =>
  items
    .filter((item) => item.type === 'profile')
    .map((item) => ({
      id: item.id,
      tg_user_id: 0,
      type: 'PERSON',
      username: item.username || `user_${item.id}`,
      telegram_url: normalizeTelegramUrl(item.telegram_url),
      logo_url: item.logoUrl,
      created_at: '',
    }));

export const mapSearchAllApiResponseToItems = (
  response: SearchAllApiResponse,
): SearchAllResponse => {
  if (Array.isArray(response)) {
    return response;
  }

  const services: SearchAllResponse = (response.services ?? []).map(
    (service) => ({
      id: service.id,
      type: 'service',
      title: service.name?.trim() || `Услуга #${service.id}`,
      description: service.description?.trim() || undefined,
      logoUrl: service.topImageUrl || undefined,
      telegram_url: normalizeTelegramUrl(service.authorTelegramUrl),
    }),
  );

  const needs: SearchAllResponse = (response.needs ?? []).map((need) => ({
    id: need.id,
    type: 'need',
    title:
      need.name?.trim() ||
      need.publicationName?.trim() ||
      `Потребность #${need.id}`,
    description:
      need.description?.trim() ||
      need.publicationDescription?.trim() ||
      undefined,
    cityName: need.cityName || undefined,
  }));

  const users: SearchAllResponse = (response.users ?? []).map((user) => ({
    id: user.id,
    type: 'profile',
    title:
      `${user.person?.name || ''} ${user.person?.surname || ''}`.trim() ||
      user.username ||
      `Профиль #${user.id}`,
    logoUrl: user.logo_url || undefined,
    cityName: user.cities?.[0]?.name,
    username: user.username || undefined,
    telegram_url: normalizeTelegramUrl(user.telegram_url),
  }));

  return [...services, ...needs, ...users];
};

export const mapSearchAllApiResponseToServices = (
  response: SearchAllApiResponse,
): SearchServiceItem[] => {
  if (Array.isArray(response)) {
    return mapFlatServices(response);
  }

  return (response.services ?? []).map((service) => ({
    id: service.id,
    name: service.name || `Услуга #${service.id}`,
    description: service.description || '',
    images: [],
    tags: service.tags || [],
    likesCount: service.likesCount ?? 0,
    commentsCount: service.commentsCount ?? 0,
    createdAt: service.createdAt || '',
    type: service.type === 'PROJECT' ? 'PROJECT' : 'SERVICE',
    authorId: service.authorId ?? 0,
    authorTelegramUrl: normalizeTelegramUrl(service.authorTelegramUrl),
    cityId: service.cityId ?? 0,
    coAuthors: service.coAuthors || [],
    needs: service.needs || [],
    topImageUrl: service.topImageUrl || '',
  }));
};

export const mapSearchAllApiResponseToNeeds = (
  response: SearchAllApiResponse,
): SearchNeedItem[] => {
  if (Array.isArray(response)) {
    return mapFlatNeeds(response);
  }

  return (response.needs ?? []).map((need) => ({
    id: need.id,
    name: need.name || need.publicationName || `Потребность #${need.id}`,
    description: need.description || need.publicationDescription,
    publicationName: need.publicationName || need.name || '',
    publicationDescription: need.publicationDescription || need.description,
    cityName: need.cityName,
  }));
};

export const mapSearchAllApiResponseToUsers = (
  response: SearchAllApiResponse,
): SearchUser[] => {
  if (Array.isArray(response)) {
    return mapFlatUsers(response);
  }

  return (response.users ?? []).map((user) => ({
    id: user.id,
    tg_user_id: user.tg_user_id ?? 0,
    type: user.type || 'PERSON',
    username: user.username || `user_${user.id}`,
    telegram_url: normalizeTelegramUrl(user.telegram_url),
    phone: user.phone,
    logo_url: user.logo_url,
    created_at: user.created_at || '',
    person: user.person,
    company: user.company,
    specializations: user.specializations,
    cities: user.cities,
    projectTopImages: user.projectTopImages,
  }));
};
