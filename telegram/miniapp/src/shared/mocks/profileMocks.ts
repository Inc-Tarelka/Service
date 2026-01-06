import { Interaction } from '../api/service/Interaction/types';
import { Publication } from '../api/service/Publication/types';
import { User } from '../api/service/User/types';
import { UserRole } from '../consts/userRoles';

export const MOCK_USER: User = {
  id: '1',
  username: 'nick_name',
  firstName: 'Иван',
  lastName: 'Иванов',
  avatarUrl:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  profession: 'Оператор',
  city: 'Москва',
  role: UserRole.USER,
  stats: {
    collaborations: 30,
    wantsToWork: 10,
    projects: 15,
  },
  about:
    'Я оператор, крутой классный человечек, живу и работаю в Москве, и еще у меня есть котёнок.',
  tags: [
    'Быстро работает 10+',
    'Профессионал 2',
    'Легко в команде 2',
    'Креативный подход 2',
  ],
  status: 'Ищу работу',
  education:
    'Национальный исследовательский технологический университет «МИСИС»',
  specialization: 'Режиссер, Оператор',
};

export const MOCK_OTHER_USER: User = {
  ...MOCK_USER,
  id: '2',
  username: 'other_nick',
  firstName: 'Петр',
  lastName: 'Петров',
  avatarUrl:
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
};

export const MOCK_PUBLICATIONS: Publication[] = Array.from({ length: 9 }).map(
  (_, i) => ({
    id: String(i),
    userId: '1',
    imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80`,
    title: 'Реклама для Яндекс Клауд',
    likesCount: 25,
  }),
);

export const MOCK_INTERACTIONS: Interaction[] = [
  {
    id: '1',
    type: 'offer',
    title: 'Отклик на потребность',
    description:
      'Могу сдать в аренду камеру модель такая-то за стоимость такую-то',
    projectName: 'Реклама для Яндекс Клауд',
    initiator: MOCK_OTHER_USER,
    createdAt: '2023-10-10',
    status: 'pending',
  },
  {
    id: '2',
    type: 'request',
    title: 'Запрос на сотрудничество',
    description:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
    initiator: MOCK_OTHER_USER,
    createdAt: '2023-10-11',
    status: 'pending',
  },
  {
    id: '3',
    type: 'request',
    title: 'Запрос на сотрудничество',
    description:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
    initiator: MOCK_OTHER_USER,
    createdAt: '2023-10-12',
    status: 'pending',
  },
];
