import type { SearchUser } from '../api/service/UserSearch/types';

export const MOCK_COLLABORATORS: SearchUser[] = [
  {
    id: 101,
    tg_user_id: 1001,
    type: 'PERSON',
    username: 'ivan_camera',
    logo_url:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 101, name: 'Иван', surname: 'Иванов' },
    specializations: [{ id: 1, name: 'Оператор' }],
    cities: [{ id: 1, name: 'Москва' }],
  },
  {
    id: 102,
    tg_user_id: 1002,
    type: 'PERSON',
    username: 'nick_name',
    logo_url:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 102, name: 'Петр', surname: 'Петров' },
    specializations: [{ id: 2, name: 'Режиссер' }],
    cities: [{ id: 2, name: 'Санкт-Петербург' }],
  },
  {
    id: 103,
    tg_user_id: 1003,
    type: 'PERSON',
    username: 'alex_director',
    logo_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 103, name: 'Александр', surname: 'Александров' },
    specializations: [{ id: 3, name: 'Продюсер' }],
    cities: [{ id: 1, name: 'Москва' }],
  },
  {
    id: 104,
    tg_user_id: 1004,
    type: 'PERSON',
    username: 'maria_sound',
    logo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 104, name: 'Мария', surname: 'Смирнова' },
    specializations: [{ id: 4, name: 'Звукорежиссер' }],
    cities: [{ id: 3, name: 'Казань' }],
  },
  {
    id: 105,
    tg_user_id: 1005,
    type: 'PERSON',
    username: 'dmitry_light',
    logo_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 105, name: 'Дмитрий', surname: 'Соколов' },
    specializations: [{ id: 5, name: 'Осветитель' }],
    cities: [{ id: 4, name: 'Екатеринбург' }],
  },
];

export const MOCK_OUTGOING_REQUESTS: SearchUser[] = [
  {
    id: 201,
    tg_user_id: 2001,
    type: 'PERSON',
    username: 'victor_producer',
    logo_url:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 201, name: 'Виктор', surname: 'Лебедев' },
    specializations: [{ id: 3, name: 'Продюсер' }],
    cities: [{ id: 1, name: 'Москва' }],
  },
  {
    id: 202,
    tg_user_id: 2002,
    type: 'PERSON',
    username: 'tatiana_photo',
    logo_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 202, name: 'Татьяна', surname: 'Семенова' },
    specializations: [{ id: 6, name: 'Фотограф' }],
    cities: [{ id: 2, name: 'Санкт-Петербург' }],
  },
  {
    id: 203,
    tg_user_id: 2003,
    type: 'PERSON',
    username: 'roman_composer',
    logo_url:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    created_at: '2024-01-01T00:00:00Z',
    person: { tarelka_user_id: 203, name: 'Роман', surname: 'Федоров' },
    specializations: [{ id: 7, name: 'Композитор' }],
    cities: [{ id: 3, name: 'Казань' }],
  },
];
