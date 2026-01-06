import { API_URL } from 'shared/api/api_url';
import { baseInstanceV1 } from 'shared/api/base';
import { Publication } from './types';

// =============================== GET PUBLICATIONS ===============================
export const getPublications = async () =>
  await baseInstanceV1.get<Publication[]>(API_URL.publications());

// =============================== GET PUBLICATION BY ID ===============================
export const getPublicationById = async (id: string) =>
  await baseInstanceV1.get<Publication>(API_URL.publication(id));
