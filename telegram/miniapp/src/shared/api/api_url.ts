export const API_URL = {
  // Auth
  login: () => '/auth/login',
  logout: () => '/auth/logout',
  telegram_register: () => '/auth/telegram/register',
  verify_code: () => '/auth/phone/verify',
  send_phone: () => '/auth/phone/send',
  refresh: () => '/auth/refresh',

  // References
  cities: () => '/references/cities',
  directions: () => '/references/directions',
  specializations: () => '/references/specializations',

  // User
  profile: () => '/users/me', // Swagger says /users/me for current user
  user: (id: string | number) => `/users/${id}`,
  // update_profile: () => '/user/update', // Not in Swagger doc.json provided, hiding for now

  // Interaction (keeping as placeholder if needed, but not in doc.json provided)
  interactions: () => '/interactions',
  interaction: (id: string) => `/interactions/${id}`,

  // Publication (keeping as placeholder)
  publications: () => '/publications',
  publication: (id: string) => `/publications/${id}`,
};
