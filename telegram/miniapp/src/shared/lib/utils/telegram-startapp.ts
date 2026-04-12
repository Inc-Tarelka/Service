import { RoutePath } from 'shared/config/routeConfig/routeConfig';

const DEFAULT_TELEGRAM_BOT_USERNAME = 'mydebbugingbot';
const SERVICE_STARTAPP_PREFIX = 'service_';

export const TELEGRAM_BOT_USERNAME =
  import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim() ||
  DEFAULT_TELEGRAM_BOT_USERNAME;
export const TELEGRAM_BOT_BASE_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

interface ParsedServiceStartParam {
  raw: string;
  type: 'service';
  publicationId: number;
}

interface ParsedReferralStartParam {
  raw: string;
  type: 'referral';
  senderId: string;
}

export type ParsedTelegramStartParam =
  | ParsedServiceStartParam
  | ParsedReferralStartParam;

export const getTelegramStartParam = (): string | null => {
  return window.Telegram?.WebApp?.initDataUnsafe?.start_param?.trim() ?? null;
};

export const parseTelegramStartParam = (
  startParam?: string | null,
): ParsedTelegramStartParam | null => {
  const normalized = startParam?.trim();
  if (!normalized) {
    return null;
  }

  const serviceMatch = normalized.match(/^service_(\d+)$/);
  if (serviceMatch) {
    const publicationId = Number(serviceMatch[1]);
    if (Number.isFinite(publicationId) && publicationId > 0) {
      return {
        raw: normalized,
        type: 'service',
        publicationId,
      };
    }
  }

  return {
    raw: normalized,
    type: 'referral',
    senderId: normalized,
  };
};

export const buildServiceStartAppParam = (publicationId: number): string => {
  return `${SERVICE_STARTAPP_PREFIX}${publicationId}`;
};

export const buildTelegramStartAppLink = (startAppParam: string): string => {
  return `${TELEGRAM_BOT_BASE_URL}?startapp=${encodeURIComponent(startAppParam)}`;
};

export const buildServiceStartAppLink = (publicationId: number): string => {
  return buildTelegramStartAppLink(buildServiceStartAppParam(publicationId));
};

export const buildSharedServiceRoute = (publicationId: number): string => {
  const route = RoutePath.service_detail.replace(':id', String(publicationId));
  return `${route}?shared=1`;
};
