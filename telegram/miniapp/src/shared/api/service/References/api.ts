import { API_URL } from 'shared/api/api_url';
import { publicInstance } from 'shared/api/base';
import { City, Direction, Specialization } from 'shared/api/types';

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
