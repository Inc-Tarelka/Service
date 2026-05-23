import {
  getUserById,
  getUserExtendedProfile,
} from 'shared/api/service/User/api';
import type { User } from 'shared/api/service/User/types';
import type { NotificationInitiator } from 'shared/api/service/Notification/types';

const NO_CONTACT_MESSAGE = 'У пользователя нет Telegram';

const normalizeTelegramUrl = (value?: string | null): string | null => {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith('http://')) {
    return normalized.replace(/^http:\/\//, 'https://');
  }

  if (normalized.startsWith('https://')) {
    return normalized;
  }

  if (normalized.startsWith('t.me/') || normalized.startsWith('www.t.me/')) {
    return `https://${normalized}`;
  }

  if (normalized.startsWith('@')) {
    return `https://t.me/${normalized.slice(1)}`;
  }

  return `https://t.me/${normalized}`;
};

const pickTelegramUrlFromUser = (
  user?: Partial<User> | null,
): string | null => {
  if (!user) return null;
  return (
    normalizeTelegramUrl(user.telegram_url) ??
    (user.username ? normalizeTelegramUrl(`@${user.username}`) : null)
  );
};

const showNoContactAlert = () => {
  const webApp = window.Telegram?.WebApp;

  if (webApp?.showAlert) {
    webApp.showAlert(NO_CONTACT_MESSAGE);
    return;
  }

  if (typeof window !== 'undefined') {
    window.alert(NO_CONTACT_MESSAGE);
  }
};

const openTelegramHttpsUrl = (url: string) => {
  const webApp = window.Telegram?.WebApp;

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

interface OpenSenderTelegramParams {
  initiator?: NotificationInitiator | null;
  senderId?: number | null;
}

export const openSenderTelegram = async (
  params: OpenSenderTelegramParams,
): Promise<boolean> => {
  const { initiator, senderId } = params;

  const fromInitiator =
    normalizeTelegramUrl(initiator?.telegramUrl) ??
    (initiator?.username
      ? normalizeTelegramUrl(`@${initiator.username}`)
      : null);

  if (fromInitiator) {
    openTelegramHttpsUrl(fromInitiator);
    return true;
  }

  if (!senderId) {
    showNoContactAlert();
    return false;
  }

  try {
    const senderResponse = await getUserById(String(senderId));
    const fromUser = pickTelegramUrlFromUser(senderResponse.data);

    if (fromUser) {
      openTelegramHttpsUrl(fromUser);
      return true;
    }
  } catch (error) {
    console.error('Failed to fetch sender by id:', error);
  }

  try {
    const extendedResponse = await getUserExtendedProfile(String(senderId));
    const fromExtended = pickTelegramUrlFromUser(extendedResponse.data?.user);

    if (fromExtended) {
      openTelegramHttpsUrl(fromExtended);
      return true;
    }
  } catch (error) {
    console.error('Failed to fetch sender extended profile:', error);
  }

  showNoContactAlert();
  return false;
};
