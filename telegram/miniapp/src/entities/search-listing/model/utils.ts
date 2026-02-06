import { Publication } from 'shared/api/service/Publication';

export const getFirstNeed = (publication: Publication) => {
  return publication.needs?.[0];
};

export const getCardTitle = (publication: Publication) => {
  const firstNeed = getFirstNeed(publication);
  return firstNeed?.name || publication.name;
};
