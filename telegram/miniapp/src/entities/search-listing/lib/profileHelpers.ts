import { SearchUser } from 'shared/api/service/UserSearch';

export const getProfileDisplayData = (user: SearchUser) => {
  const isPerson = user.type === 'PERSON';
  const name = isPerson
    ? `${user.person?.name || ''} ${user.person?.surname || ''}`.trim()
    : user.company?.company_name || '';

  const userId =
    (isPerson ? user.person?.tarelka_user_id : user.company?.tarelka_user_id) ||
    user.id;

  const specializations =
    user.specializations?.map((s) => s.name).join(', ') || 'Специалист';
  const cities = user.cities?.map((c) => c.name).join(', ') || 'Город';

  return {
    name: name || user.username,
    userId,
    specializations,
    cities,
    logoUrl: user.logo_url,
    telegramLabel:
      user.telegram_url || (user.username ? `@${user.username}` : ''),
  };
};
