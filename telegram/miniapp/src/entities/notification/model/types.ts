import type { NotificationCardVariant, NotificationTab } from '../consts';

export interface Notification {
  id: string;
  variant: NotificationCardVariant;
  title: string;
  body?: string;
  date: string;
  tab: NotificationTab;
  isRead?: boolean;
}
