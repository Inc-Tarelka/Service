import { City, Specialization } from 'shared/api/types';

export const transformCitiesForSelect = (cities: City[]) =>
  cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

export const transformSpecializationsForSelect = (specs: Specialization[]) =>
  specs.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

export const WORKING_STATUS_OPTIONS = [
  { value: 'LOOKING', label: 'Ищет работу' },
  { value: 'NOT_LOOKING', label: 'Не ищет' },
  { value: 'OPEN_TO_OFFERS', label: 'Рассматривает предложения' },
] as const;
