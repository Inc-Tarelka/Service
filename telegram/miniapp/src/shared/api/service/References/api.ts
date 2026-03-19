import { API_URL } from 'shared/api/api_url';
import { publicInstance } from 'shared/api/base';
import {
  City,
  Direction,
  NeedTag,
  PublicationTag,
  Specialization,
} from 'shared/api/types';

export const getCitiesRequest = async (): Promise<City[]> => {
  const response = await publicInstance.get<City[]>(API_URL.cities());
  return response.data;
};

export const getDirectionsRequest = async (): Promise<Direction[]> => {
  const response = await publicInstance.get<Direction[]>(API_URL.directions());
  return response.data;
};

export const getSpecializationsRequest = async (): Promise<
  Specialization[]
> => {
  const response = await publicInstance.get<Specialization[]>(
    API_URL.specializations(),
  );
  return response.data;
};

export const getPublicationTagsRequest = async (): Promise<
  PublicationTag[]
> => {
  const response = await publicInstance.get<PublicationTag[]>(
    API_URL.publication_tags(),
  );
  return response.data;
};

export const getNeedsTagsRequest = async (): Promise<NeedTag[]> => {
  const response = await publicInstance.get<NeedTag[]>(API_URL.needs_tags());
  return response.data;
};
