export const API_URL = {
  // Auth
  login: () => '/auth/login',
  logout: () => '/auth/logout',
  pre_register: () => '/auth/pre-register',
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

  // Publications
  generate_url_publication: () => '/publications/images/presign',
  post_publication: () => '/publications',
  search_publications: () => '/publications/search',
  search_publication_needs: () => '/publications/needs/search',
  search_publication_services: () => '/publications/services/search',

  // Posts
  posts: () => '/posts',
  post_tags: () => '/posts/tags',

  // User
  delete_account: () => '/users/me',
  me: () => '/users/me',
  search_users: () => '/users/search/filters',
};
