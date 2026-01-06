export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export const USER_ROLES_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'User',
  [UserRole.ADMIN]: 'Admin',
};
