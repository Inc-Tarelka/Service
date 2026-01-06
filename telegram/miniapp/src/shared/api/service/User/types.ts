import { UserRole } from 'shared/consts/userRoles';

export interface UserStats {
  collaborations: number;
  wantsToWork: number;
  projects: number;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  profession?: string;
  city?: string;
  role: UserRole;
  stats: UserStats;
  about?: string;
  tags?: string[];
  status?: string;
  education?: string;
  specialization?: string;
}
