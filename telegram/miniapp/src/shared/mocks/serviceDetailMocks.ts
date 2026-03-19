import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';

export interface MockComment {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
  replies?: MockComment[];
}

export const MOCK_SERVICE_DETAIL: SearchServiceItem = {
  id: 1,
  name: 'Реклама для Яндекс Клауд',
  description: 'Описание проекта текстовое бла бла бла бла бла бла бла',
  images: [
    {
      id: 1,
      position: 0,
      url: 'https://1b01be53-7328-445f-bcbb-3d034234b329.selstorage.ru/publication/tmp/7/61c6563f-204d-484d-8b58-b6e15b883ab4.jpg',
    },
  ],
  tags: [
    { id: 1, name: 'Артхаус' },
    { id: 2, name: 'Короткий метр' },
  ],
  likesCount: 25,
  commentsCount: 3,
  viewsCount: 99,
  createdAt: '2025-08-22T12:00:00Z',
  type: 'PROJECT',
  authorId: 101,
  authorTelegramUrl: 'https://t.me/ivan_camera',
  cityId: 1,
  topImageUrl:
    'https://1b01be53-7328-445f-bcbb-3d034234b329.selstorage.ru/publication/tmp/7/61c6563f-204d-484d-8b58-b6e15b883ab4.jpg',
  coAuthors: [
    {
      id: 101,
      username: 'Иван Иванов',
      education: 'Оператор',
      logo_url:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      type: 'PERSON',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 102,
      username: 'Иван Иванов',
      education: 'Оператор',
      logo_url:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      type: 'PERSON',
      created_at: '2024-02-01T00:00:00Z',
    },
  ],
  needs: [
    {
      id: 1,
      name: 'Оператор на короткий метр',
      description:
        'Описание вакансии или потребности в услуге, текст в три строки, дальше троеточие как здесь, показано',
      budget: 0,
      cityId: 1,
      deadlineStart: '2025-09-01T00:00:00Z',
      deadlineEnd: '2025-10-01T00:00:00Z',
      publicationId: 1,
      tags: [],
    },
    {
      id: 2,
      name: 'Оператор на короткий метр',
      description:
        'Описание вакансии или потребности в услуге, текст в три строки, дальше троеточие как здесь, показано',
      budget: 0,
      cityId: 1,
      deadlineStart: '2025-09-01T00:00:00Z',
      deadlineEnd: '2025-10-01T00:00:00Z',
      publicationId: 1,
      tags: [],
    },
  ],
};

export const MOCK_CITY_MAP: Record<number, string> = {
  1: 'Москва',
  2: 'Санкт-Петербург',
  3: 'Казань',
  4: 'Екатеринбург',
  5: 'Новосибирск',
  6: 'Краснодар',
};

export const MOCK_COMMENTS: MockComment[] = [
  {
    id: 1,
    firstName: 'Иван',
    lastName: 'Иванов',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    text: 'Крутой проект, хочу участвовать!',
    createdAt: '2025-08-23T10:30:00Z',
    replies: [
      {
        id: 4,
        firstName: 'Петр',
        lastName: 'Петров',
        avatarUrl:
          'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
        text: 'Согласен, выглядит интересно',
        createdAt: '2025-08-23T11:00:00Z',
      },
    ],
  },
  {
    id: 2,
    firstName: 'Мария',
    lastName: 'Смирнова',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    text: 'Когда начало съемок?',
    createdAt: '2025-08-24T14:15:00Z',
  },
  {
    id: 3,
    firstName: 'Александр',
    lastName: 'Александров',
    text: 'Отличная идея для проекта',
    createdAt: '2025-08-25T09:45:00Z',
  },
];
