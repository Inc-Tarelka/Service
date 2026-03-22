import type { GenerateInviteLinkResponse } from './types';

export const generateInviteLink = async (
  userId: number | string,
): Promise<GenerateInviteLinkResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        link: `https://t.me/Tarelka_dev_weak_bot?startapp=senderID${userId}`,
      });
    }, 500);
  });
};
