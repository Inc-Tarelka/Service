import { makeAutoObservable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import {
  getCitiesRequest,
  getDirectionsRequest,
  getNeedsTagsRequest,
  getPublicationTagsRequest,
  getSpecializationsRequest,
} from 'shared/api/service/References/api';
import {
  City,
  Direction,
  NeedTag,
  PublicationTag,
  Specialization,
} from 'shared/api/types';

export class ReferenceStore {
  citiesData?: IPromiseBasedObservable<City[]>;
  directionsData?: IPromiseBasedObservable<Direction[]>;
  specializationsData?: IPromiseBasedObservable<Specialization[]>;
  publicationTagsData?: IPromiseBasedObservable<PublicationTag[]>;
  needsTagsData?: IPromiseBasedObservable<NeedTag[]>;
  private citiesRequest?: Promise<void>;
  private directionsRequest?: Promise<void>;
  private specializationsRequest?: Promise<void>;
  private publicationTagsRequest?: Promise<void>;
  private needsTagsRequest?: Promise<void>;

  cities: City[] = [];
  directions: Direction[] = [];
  specializations: Specialization[] = [];
  publicationTags: PublicationTag[] = [];
  needsTags: NeedTag[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  getCitiesAction = async (): Promise<void> => {
    if (this.citiesData?.state === 'fulfilled') return;
    if (this.cities.length > 0) return;
    if (this.citiesRequest) return this.citiesRequest;

    this.citiesRequest = (async () => {
      try {
        const promise = getCitiesRequest();
        this.citiesData = fromPromise(promise);
        const data = await promise;
        this.cities = data;
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        this.citiesRequest = undefined;
      }
    })();

    return this.citiesRequest;
  };

  getDirectionsAction = async (): Promise<void> => {
    if (this.directionsData?.state === 'fulfilled') return;
    if (this.directions.length > 0) return;
    if (this.directionsRequest) return this.directionsRequest;

    this.directionsRequest = (async () => {
      try {
        const promise = getDirectionsRequest();
        this.directionsData = fromPromise(promise);
        const data = await promise;
        this.directions = data;
      } catch (error) {
        console.error('Error loading directions:', error);
      } finally {
        this.directionsRequest = undefined;
      }
    })();

    return this.directionsRequest;
  };

  getSpecializationsAction = async (): Promise<void> => {
    if (this.specializationsData?.state === 'fulfilled') return;
    if (this.specializations.length > 0) return;
    if (this.specializationsRequest) return this.specializationsRequest;

    this.specializationsRequest = (async () => {
      try {
        const promise = getSpecializationsRequest();
        this.specializationsData = fromPromise(promise);
        const data = await promise;
        this.specializations = data;
      } catch (error) {
        console.error('Error loading specializations:', error);
      } finally {
        this.specializationsRequest = undefined;
      }
    })();

    return this.specializationsRequest;
  };

  getPublicationTagsAction = async (): Promise<void> => {
    if (this.publicationTagsData?.state === 'fulfilled') return;
    if (this.publicationTags.length > 0) return;
    if (this.publicationTagsRequest) return this.publicationTagsRequest;

    this.publicationTagsRequest = (async () => {
      try {
        const promise = getPublicationTagsRequest();
        this.publicationTagsData = fromPromise(promise);
        const data = await promise;
        this.publicationTags = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error loading publication tags:', error);
      } finally {
        this.publicationTagsRequest = undefined;
      }
    })();

    return this.publicationTagsRequest;
  };

  getNeedsTagsAction = async (): Promise<void> => {
    if (this.needsTagsData?.state === 'fulfilled') return;
    if (this.needsTags.length > 0) return;
    if (this.needsTagsRequest) return this.needsTagsRequest;

    this.needsTagsRequest = (async () => {
      try {
        const promise = getNeedsTagsRequest();
        this.needsTagsData = fromPromise(promise);
        const data = await promise;
        this.needsTags = data;
      } catch (error) {
        console.error('Error loading needs tags:', error);
      } finally {
        this.needsTagsRequest = undefined;
      }
    })();

    return this.needsTagsRequest;
  };
}

export const referenceStore = new ReferenceStore();
