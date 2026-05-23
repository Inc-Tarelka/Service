type NotificationCardVariant = 'with_body' | 'without_body';
type NotificationTab = 'all' | 'collaboration' | 'responses' | 'mentions';

export interface NotificationSenderMock {
  name: string;
  username: string;
  meta: string;
  avatarUrl?: string;
}

export interface NotificationLinkedItemMock {
  title: string;
  description: string;
  thumbnailUrl?: string;
}

export interface NotificationMock {
  id: string;
  variant: NotificationCardVariant;
  username: string;
  title: string;
  body?: string;
  date: string;
  tab: NotificationTab;
  isRead?: boolean;
  sender?: NotificationSenderMock;
  linkedItem?: NotificationLinkedItemMock;
  need?: NotificationLinkedItemMock;
  comment?: string;
  linkedServiceId?: string;
}

export interface NotificationGroupMock {
  id: string;
  title: string;
  isHighlighted?: boolean;
  items: NotificationMock[];
}

const MOCK_SENDER: NotificationSenderMock = {
  name: 'Иван Иванов',
  username: 'nick_name',
  meta: 'Оператор, Москва',
};

const MOCK_SERVICE: NotificationLinkedItemMock = {
  title: 'Реклама для Яндекс Клауд',
  description: 'Описание проекта текстовое бла бла бла бла бла бла бла',
};

const MOCK_NEED: NotificationLinkedItemMock = {
  title: 'Оператор на короткий метр',
  description:
    'Описание вакансии или потребности в услуге, текст в три строки, дальше троеточие дальше троеточие',
};

export const MOCK_NOTIFICATIONS: NotificationMock[] = [
  {
    id: 'c1',
    variant: 'with_body',
    username: 'nick_name',
    title: 'отправил вам запрос на сотрудничество:',
    body: 'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
    date: '15 января',
    tab: 'collaboration',
    isRead: false,
    sender: MOCK_SENDER,
    linkedItem: MOCK_SERVICE,
    comment:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
  },
  {
    id: 'c2',
    variant: 'with_body',
    username: 'nick_name',
    title: 'отправил вам запрос на сотрудничество:',
    body: 'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
    date: '15 января',
    tab: 'collaboration',
    isRead: false,
    sender: MOCK_SENDER,
    linkedItem: MOCK_SERVICE,
    comment:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
  },
  {
    id: 'c3',
    variant: 'without_body',
    username: 'nick_name',
    title: 'отправил вам запрос на сотрудничество',
    date: '15 января',
    tab: 'collaboration',
    isRead: false,
    sender: MOCK_SENDER,
    linkedItem: MOCK_SERVICE,
    comment:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
  },
  {
    id: 'c4',
    variant: 'without_body',
    username: 'nick_name',
    title: 'отправил вам запрос на сотрудничество',
    date: '15 января',
    tab: 'collaboration',
    isRead: true,
    sender: MOCK_SENDER,
    linkedItem: MOCK_SERVICE,
    comment:
      'Хотел бы предложить вам работу оператором в новом проекте "Звезды в Африке"',
  },
  {
    id: 'm1',
    variant: 'without_body',
    username: 'nick_name',
    title:
      'хочет отметить вас в своем проекте "Рекламный ролик для Яндекс Клауд"',
    date: '15 января',
    tab: 'mentions',
    isRead: false,
    linkedServiceId: '67',
  },
  {
    id: 'm2',
    variant: 'without_body',
    username: 'nick_name',
    title:
      'хочет отметить вас в своем проекте "Рекламный ролик для Яндекс Клауд"',
    date: '15 января',
    tab: 'mentions',
    isRead: false,
    linkedServiceId: '67',
  },
  {
    id: 'm3',
    variant: 'without_body',
    username: 'nick_name',
    title:
      'хочет отметить вас в своем проекте "Рекламный ролик для Яндекс Клауд"',
    date: '15 января',
    tab: 'mentions',
    isRead: true,
    linkedServiceId: '67',
  },
];

export const MOCK_NOTIFICATION_GROUPS: NotificationGroupMock[] = [
  {
    id: 'need-1',
    title: 'Потребность "Аренда камеры"',
    items: [
      {
        id: 'r1',
        variant: 'with_body',
        username: 'nick_name',
        title: 'откликнулся на вашу потребность "Аренда камеры":',
        body: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
        date: '15 января',
        tab: 'responses',
        isRead: false,
        sender: MOCK_SENDER,
        linkedItem: MOCK_SERVICE,
        need: MOCK_NEED,
        comment: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
      },
      {
        id: 'r2',
        variant: 'with_body',
        username: 'nick_name',
        title: 'откликнулся на вашу потребность "Аренда камеры":',
        body: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
        date: '15 января',
        tab: 'responses',
        isRead: false,
        sender: MOCK_SENDER,
        linkedItem: MOCK_SERVICE,
        need: MOCK_NEED,
        comment: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
      },
    ],
  },
  {
    id: 'need-2',
    title: 'Потребность "Оператор на короткометражный фильм"',
    isHighlighted: true,
    items: [
      {
        id: 'r3',
        variant: 'with_body',
        username: 'nick_name',
        title:
          'откликнулся на вашу потребность "Оператор на короткометражный фильм":',
        body: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
        date: '15 января',
        tab: 'responses',
        isRead: false,
        sender: MOCK_SENDER,
        linkedItem: MOCK_SERVICE,
        need: MOCK_NEED,
        comment: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
      },
    ],
  },
  {
    id: 'need-3',
    title: 'Потребность "Аренда камеры"',
    items: [
      {
        id: 'r4',
        variant: 'with_body',
        username: 'nick_name',
        title: 'откликнулся на вашу потребность "Аренда камеры":',
        body: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
        date: '15 января',
        tab: 'responses',
        isRead: true,
        sender: MOCK_SENDER,
        linkedItem: MOCK_SERVICE,
        need: MOCK_NEED,
        comment: 'Могу предоставить оборудование для съемок с 12.03 на три дня',
      },
    ],
  },
];
