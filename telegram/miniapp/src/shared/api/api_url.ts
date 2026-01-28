export const API_URL = {
  // Auth
  login: () => '/auth/login',
  logout: () => '/auth/logout',
  telegram_register: () => '/auth/telegram/register',
  verify_code: () => '/auth/phone/verify',
  send_phone: () => '/auth/phone/send',
  refresh: () => '/auth/refresh',
  forgot_password: () => '/auth/password/forgot',
  reset_password: () => '/auth/password/reset',

  // References
  cities: () => '/references/cities',
  directions: () => '/references/directions',
  specializations: () => '/references/specializations',

  profile: () => '/users/me',
  user: (id: string | number) => `/users/${id}`,

  interactions: () => '/interactions',
  interaction: (id: string) => `/interactions/${id}`,

  publications: () => '/publications',
  publication: (id: string) => `/publications/${id}`,

  // Posts
  posts: () => '/posts',
  post_tags: () => '/posts/tags',
};
