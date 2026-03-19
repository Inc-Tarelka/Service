export const NOTIFICATION_CARD_VARIANT = {
  WITH_BODY: 'with_body',
  WITHOUT_BODY: 'without_body',
} as const;

export type NotificationCardVariant =
  (typeof NOTIFICATION_CARD_VARIANT)[keyof typeof NOTIFICATION_CARD_VARIANT];

export const NOTIFICATION_TAB = {
  ALL: 'all',
  COLLABORATION: 'collaboration',
  RESPONSES: 'responses',
  MENTIONS: 'mentions',
} as const;

export type NotificationTab =
  (typeof NOTIFICATION_TAB)[keyof typeof NOTIFICATION_TAB];
