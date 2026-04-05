import type { Teammate } from 'shared/api/service/User/types';
import type {
  CoauthorSearchUser,
  SearchUser,
} from 'shared/api/service/UserSearch/types';

export type AnyCollaborator = SearchUser | CoauthorSearchUser | Teammate;

export const formatCollaboratorName = (
  collaborator: AnyCollaborator,
): string => {
  if ('person' in collaborator && collaborator.person) {
    return `${collaborator.person.name} ${collaborator.person.surname}`.trim();
  }
  if ('firstName' in collaborator) {
    return `${collaborator.firstName ?? ''} ${collaborator.lastName ?? ''}`.trim();
  }
  if ('name' in collaborator) {
    return `${collaborator.name ?? ''} ${collaborator.surname ?? ''}`.trim();
  }
  return '';
};

export const formatCollaboratorMeta = (
  collaborator: AnyCollaborator,
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
  if ('specialization' in collaborator) {
    return [collaborator.specialization, collaborator.city]
      .filter(Boolean)
      .join(', ');
  }
  return '';
};
