import { lazy } from 'react';

const NotInTelegramPlaceholderLazy = lazy(
  () => import('./ui/NotInTelegramPlaceholder'),
);

export { NotInTelegramPlaceholderLazy };
