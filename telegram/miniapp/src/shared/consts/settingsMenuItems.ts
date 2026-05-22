import WebApp from '@twa-dev/sdk';
import { ComponentType, SVGProps } from 'react';
import {
  CommentIcon,
  DeleteIcon,
  InfoIcon,
  LaptopIcon,
  LogOutIcon,
  NotificationIcon,
  PasswordIcon,
  PersonIcon,
} from 'shared/assets/settings-icons';

export type SettingSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'terms'
  | null;

export interface MenuItem {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  section: SettingSection;
  action?: () => void;
  isDanger?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: 'profile',
    label: 'Аккаунт и профиль',
    icon: PersonIcon,
    section: 'profile',
  },
  {
    id: 'security',
    label: 'Пароль и безопасность',
    icon: PasswordIcon,
    section: 'security',
  },
  {
    id: 'notifications',
    label: 'Уведомления',
    icon: NotificationIcon,
    section: 'notifications',
  },
  {
    id: 'desk',
    label: 'Добавить на рабочий стол',
    icon: LaptopIcon,
    section: null,
    action: () => {
      const webApp = window.Telegram?.WebApp;
      if (webApp && 'addToHomeScreen' in webApp) {
        WebApp.addToHomeScreen();
      } else {
        console.log('addToHomeScreen not supported');
      }
    },
  },
  {
    id: 'terms',
    label: 'Условия использования',
    icon: InfoIcon,
    section: 'terms',
  },
];

export const dangerMenuItems: MenuItem[] = [
  {
    id: 'support',
    label: 'Поддержка',
    icon: CommentIcon,
    section: null,
    action: () => {
      console.log('Open support');
    },
  },
  {
    id: 'logout',
    label: 'Выйти',
    icon: LogOutIcon,
    section: null,
    isDanger: true,
    action: () => {
      console.log('Logout');
    },
  },
  {
    id: 'logout-all',
    label: 'Выйти со всех устройств',
    icon: LogOutIcon,
    section: null,
    isDanger: true,
    action: () => {
      console.log('Logout all');
    },
  },
  {
    id: 'delete',
    label: 'Удалить аккаунт',
    icon: DeleteIcon,
    section: null,
    isDanger: true,
    action: () => {
      console.log('Delete account');
    },
  },
];
