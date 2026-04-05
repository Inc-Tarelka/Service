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
  specializations: () => 'references/specializations',
  publication_tags: () => 'references/publication-tags',
  needs_tags: () => 'references/need-tags',

  profile: () => '/users/me',
  me_profile: () => '/users/me/profile',
  me_teammates: () => '/users/me/teammates',
  user: (id: string | number) => `/users/${id}`,
  user_profile: (id: string | number) => `/users/${id}/profile`,

  interactions: () => '/interactions',
  interaction: (id: string) => `/interactions/${id}`,

  // Publications
  generate_url_publication: () => '/publications/images/presign',
  post_publication: () => '/publications',
  search_publications: () => '/publications/search',
  search_publication_needs: () => '/publications/needs/search',
  search_publication_services: () => '/publications/services/search',
  get_publication_details: (id: string) => `/publications/${id}`,
  update_publication: (id: string) => `/publications/${id}`,
  publication_like: (id: string) => `/publications/${id}/likes`,
  publication_comment: (id: string) => `/publications/${id}/comments`,
  publication_comment_post: (id: string) => `/publications/${id}/comments`,

  // Posts
  posts: () => '/posts',
  post_tags: () => '/posts/tags',

  // User
  delete_account: () => '/users/me',
  me: () => '/users/me',
  search_users: () => '/users/search/filters',

  // User media
  user_logo_presign: (id: number) => `/users/${id}/logo/presign`,
  user_logo_confirm: (id: number) => `/users/${id}/logo/confirm`,
  user_logo_url: (id: number) => `/users/${id}/logo/url`,
  user_wallpaper_presign: (id: number) => `/users/${id}/wallpaper/presign`,
  user_wallpaper_confirm: (id: number) => `/users/${id}/wallpaper/confirm`,
  user_wallpaper_url: (id: number) => `/users/${id}/wallpaper/url`,

  // Needs
  details_needs: (id: string) => `/needs/${id}`,

  // Search
  search_coauthors: () => '/users/search/name',

  // Referral
  create_invite_link: () => '/createInviteLink',

  // Notifications
  notifications_collaboration: () => '/notifications/collaboration',
  notifications_need_response: () => '/notifications/need-response',

  // My projects
  my_projects: () => '/publications/my/projects',
};
