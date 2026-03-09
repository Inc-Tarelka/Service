import type { SearchUser } from 'shared/api/service/UserSearch/types';

export const formatCollaboratorName = (
  collaborator: SearchUser | any,
): string => {
  return collaborator.person
    ? `${collaborator.person.name} ${collaborator.person.surname}`.trim()
    : collaborator.username || '';
};

export const formatCollaboratorMeta = (
  collaborator: SearchUser | any,
): string => {
  const specialization = collaborator.specializations?.[0]?.name;
  const city = collaborator.cities?.[0]?.name;
  return [specialization, city].filter(Boolean).join(', ');
};
