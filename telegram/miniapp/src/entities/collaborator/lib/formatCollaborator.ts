import type {
  CoauthorSearchUser,
  SearchUser,
} from 'shared/api/service/UserSearch/types';

export const formatCollaboratorName = (
  collaborator: SearchUser | CoauthorSearchUser,
): string => {
  if ('person' in collaborator && collaborator.person) {
    return `${collaborator.person.name} ${collaborator.person.surname}`.trim();
  }
  if ('name' in collaborator) {
    return `${collaborator.name ?? ''} ${collaborator.surname ?? ''}`.trim();
  }
  return '';
};

export const formatCollaboratorMeta = (
  collaborator: SearchUser | CoauthorSearchUser,
): string => {
  if ('specializations' in collaborator) {
    const specialization = collaborator.specializations?.[0]?.name;
    const city = collaborator.cities?.[0]?.name;
    return [specialization, city].filter(Boolean).join(', ');
  }
  if ('specialisation' in collaborator) {
    const city = collaborator.city?.name;
    return [collaborator.specialisation, city].filter(Boolean).join(', ');
  }
  return '';
};
