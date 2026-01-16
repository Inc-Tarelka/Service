import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  getCitiesRequest,
  getDirectionsRequest,
  getSpecializationsRequest,
} from 'shared/api/service/References/api';
import { City, Direction, Specialization } from 'shared/api/types';

export class ReferenceStore {
  citiesData?: IPromiseBasedObservable<City[]>;
  directionsData?: IPromiseBasedObservable<Direction[]>;
  specializationsData?: IPromiseBasedObservable<Specialization[]>;

  cities: City[] = [];
  directions: Direction[] = [];
  specializations: Specialization[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  getCitiesAction = async () => {
    if (this.cities.length > 0) return;
    try {
      const promise = getCitiesRequest();
      this.citiesData = fromPromise(promise);
      const data = await promise;
      this.cities = data;
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  getDirectionsAction = async () => {
    if (this.directions.length > 0) return;
    try {
      const promise = getDirectionsRequest();
      this.directionsData = fromPromise(promise);
      const data = await promise;
      this.directions = data;
    } catch (error) {
      console.error('Error loading directions:', error);
    }
  };

  getSpecializationsAction = async () => {
    if (this.specializations.length > 0) return;
    try {
      const promise = getSpecializationsRequest();
      this.specializationsData = fromPromise(promise);
      const data = await promise;
      this.specializations = data;
    } catch (error) {
      console.error('Error loading specializations:', error);
    }
  };
}

export const referenceStore = new ReferenceStore();
