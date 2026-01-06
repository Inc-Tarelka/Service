export const API_URL = {
  // Auth
  login: () => '/auth/login',
  register: () => '/auth/register',
  verify_code: () => '/auth/verify',
  reset_password: () => '/auth/reset-password',
  set_new_password: () => '/auth/set-new-password',

  // User
  profile: () => '/user/profile',
  user: (id: string) => `/user/${id}`,
  update_profile: () => '/user/update',

  // Interaction
  interactions: () => '/interactions',
  interaction: (id: string) => `/interactions/${id}`,

  // Publication
  publications: () => '/publications',
  publication: (id: string) => `/publications/${id}`,
};
