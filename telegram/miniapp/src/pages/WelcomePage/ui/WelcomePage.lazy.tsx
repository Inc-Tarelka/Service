import { lazy } from 'react';

export const WelcomePageLazy = lazy(() =>
  import('./WelcomePage').then((module) => ({ default: module.WelcomePage })),
);
