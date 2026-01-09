import { lazy } from 'react';

export const NotFoundPageLazy = lazy(() =>
  import('./NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);
