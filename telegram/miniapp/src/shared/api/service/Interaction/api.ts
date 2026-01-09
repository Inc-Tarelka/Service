import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import { Interaction } from './types';

// =============================== GET INTERACTIONS ===============================
export const getInteractions = async () =>
  await baseInstanceV1.get<Interaction[]>(API_URL.interactions());

// =============================== GET INTERACTION BY ID ===============================
export const getInteractionById = async (id: string) =>
  await baseInstanceV1.get<Interaction>(API_URL.interaction(id));
