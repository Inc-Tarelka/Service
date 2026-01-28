import { User } from 'shared/api/service/User/types';
import { UserRole } from 'shared/consts/userRoles';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Вита',
    lastName: 'Канищева',
    username: 'nick_name',
    profession: 'Оператор',
    city: 'Москва',
    role: UserRole.USER,
    stats: { collaborations: 0, wantsToWork: 0, projects: 0 },
  },
  {
    id: '2',
    firstName: 'Виталий',
    lastName: 'Петров',
    username: 'nick_name',
    profession: 'Оператор',
    city: 'Москва',
    role: UserRole.USER,
    stats: { collaborations: 0, wantsToWork: 0, projects: 0 },
  },
  {
    id: '3',
    firstName: 'Виталий',
    lastName: 'Иванов',
    username: 'nick_name',
    profession: 'Оператор',
    city: 'Москва',
    role: UserRole.USER,
    stats: { collaborations: 0, wantsToWork: 0, projects: 0 },
  },
];
