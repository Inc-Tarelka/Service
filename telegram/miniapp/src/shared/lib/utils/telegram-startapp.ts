import { RoutePath } from 'shared/config/routeConfig/routeConfig';

const DEFAULT_TELEGRAM_BOT_USERNAME = 'Tarelka_dev_weak_bot';
const SERVICE_STARTAPP_PREFIX = 'service_';
const USER_STARTAPP_PREFIX = 'user_';
const REFERRAL_SENDER_ID_STORAGE_KEY = 'tarelka_referral_sender_id';
const REFERRAL_INVITE_LINK_STORAGE_KEY = 'tarelka_referral_invite_link';

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

const getStartParamFromLocation = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const url = new URL(window.location.href);
    return (
      url.searchParams.get('startapp')?.trim() ??
      url.searchParams.get('start_param')?.trim() ??
      null
    );
  } catch {
    return null;
  }
};

export const getTelegramStartParam = (): string | null => {
  return (
    window.Telegram?.WebApp?.initDataUnsafe?.start_param?.trim() ??
    getStartParamFromLocation()
  );
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

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error(
      'Unable to access localStorage for referral sender id',
      error,
    );
    return null;
  }
};

const normalizeSenderId = (senderId?: string | null): string | null => {
  const normalized = senderId?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
};

export const setStoredReferralSenderId = (senderId: string): void => {
  const storage = getStorage();
  const normalized = normalizeSenderId(senderId);

  if (!storage || !normalized) {
    return;
  }

  storage.setItem(REFERRAL_SENDER_ID_STORAGE_KEY, normalized);
  storage.setItem(
    REFERRAL_INVITE_LINK_STORAGE_KEY,
    buildTelegramStartAppLink(normalized),
  );
};

export const getStoredReferralSenderId = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return normalizeSenderId(storage.getItem(REFERRAL_SENDER_ID_STORAGE_KEY));
};

export const clearStoredReferralSenderId = (): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(REFERRAL_SENDER_ID_STORAGE_KEY);
  storage.removeItem(REFERRAL_INVITE_LINK_STORAGE_KEY);
};

export const getStoredReferralInviteLink = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const storedInviteLink = storage.getItem(REFERRAL_INVITE_LINK_STORAGE_KEY);
  if (storedInviteLink?.trim()) {
    return storedInviteLink.trim();
  }

  const senderId = getStoredReferralSenderId();
  return senderId ? buildTelegramStartAppLink(senderId) : null;
};

export const getReferralSenderIdFromStartParam = (
  startParam?: string | null,
): string | null => {
  const parsedStartParam = parseTelegramStartParam(
    startParam ?? getTelegramStartParam(),
  );
  return parsedStartParam?.type === 'referral'
    ? normalizeSenderId(parsedStartParam.senderId)
    : null;
};

export const persistReferralSenderIdFromStartParam = (
  startParam?: string | null,
): string | null => {
  const senderId = getReferralSenderIdFromStartParam(startParam);
  if (!senderId) {
    return null;
  }

  setStoredReferralSenderId(senderId);
  return senderId;
};

const TELEGRAM_INVITE_HOSTS = new Set([
  't.me',
  'www.t.me',
  'telegram.me',
  'www.telegram.me',
]);

const toTelegramUrlCandidate = (value: string): string | null => {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (
    value.startsWith('t.me/') ||
    value.startsWith('www.t.me/') ||
    value.startsWith('telegram.me/') ||
    value.startsWith('www.telegram.me/')
  ) {
    return `https://${value}`;
  }

  return null;
};

export const getReferralSenderIdFromInviteLink = (
  inviteLink: string,
): string | null => {
  const normalizedInviteLink = inviteLink.trim();
  if (!normalizedInviteLink) {
    return null;
  }

  const senderIdFromRaw =
    getReferralSenderIdFromStartParam(normalizedInviteLink);
  if (senderIdFromRaw) {
    return senderIdFromRaw;
  }

  const urlCandidate = toTelegramUrlCandidate(normalizedInviteLink);
  if (!urlCandidate) {
    return null;
  }

  try {
    const inviteUrl = new URL(urlCandidate);
    if (!TELEGRAM_INVITE_HOSTS.has(inviteUrl.hostname.toLowerCase())) {
      return null;
    }

    const botUsernameFromPath = inviteUrl.pathname
      .replace(/^\/+/, '')
      .split('/')[0];
    if (
      botUsernameFromPath &&
      botUsernameFromPath.toLowerCase() !== TELEGRAM_BOT_USERNAME.toLowerCase()
    ) {
      return null;
    }

    const startAppParam = inviteUrl.searchParams.get('startapp');
    if (!startAppParam) {
      return null;
    }

    return getReferralSenderIdFromStartParam(startAppParam);
  } catch {
    return null;
  }
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

export const buildUserStartAppParam = (userId: number | string): string => {
  return `${USER_STARTAPP_PREFIX}${userId}`;
};

export const buildUserStartAppLink = (userId: number | string): string => {
  return buildTelegramStartAppLink(buildUserStartAppParam(userId));
};
