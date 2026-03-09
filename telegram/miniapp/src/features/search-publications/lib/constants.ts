import { SearchPublicationsType } from 'shared/api/types';

export const DRAWER_SIZES: Record<SearchPublicationsType, number | string> = {
  [SearchPublicationsType.PROFILE]: 480,
  [SearchPublicationsType.SERVICE]: 480,
  [SearchPublicationsType.NEED]: '90%',
  [SearchPublicationsType.PROJECT]: 480,
  [SearchPublicationsType.ALL]: 480,
};

export const DRAWER_STYLES = {
  content: {
    borderRadius: '32px 32px 0 0',
  },
  body: { padding: 0, paddingBottom: 0, height: '100%' },
};

export const DATE_DRAWER_STYLES = {
  content: {
    borderRadius: '32px 32px 0 0',
    overflow: 'hidden',
  },
  body: { padding: 0 },
};
