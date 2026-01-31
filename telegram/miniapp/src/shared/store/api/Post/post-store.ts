import { makeAutoObservable } from 'mobx';
import type {
  PostCollaborator,
  PostNeed,
  PostType,
} from 'shared/api/service/Post/types';

export interface PostFormValues {
  title: string;
  description: string;
  type: PostType;
  tagIds: string[];
  cityId: string;
}

export class PostStore {
  formValues: PostFormValues = {
    title: '',
    description: '',
    type: 'project',
    tagIds: [],
    cityId: '',
  };

  collaborators: PostCollaborator[] = [];
  needs: PostNeed[] = [];
  carouselIndex = 0;
  searchQuery = '';

  constructor() {
    makeAutoObservable(this);
  }

  // Form actions
  setFormValue = <K extends keyof PostFormValues>(
    field: K,
    value: PostFormValues[K],
  ): void => {
    this.formValues[field] = value;
  };

  // Collaborator actions
  addCollaborator = (collaborator: PostCollaborator): void => {
    if (!this.collaborators.find((c) => c.id === collaborator.id)) {
      this.collaborators.push(collaborator);
    }
  };

  removeCollaborator = (id: string): void => {
    this.collaborators = this.collaborators.filter((c) => c.id !== id);
  };

  // Need actions
  addNeed = (need: PostNeed): void => {
    this.needs.push(need);
  };

  removeNeed = (index: number): void => {
    this.needs = this.needs.filter((_, i) => i !== index);
  };

  // Carousel actions
  setCarouselIndex = (index: number): void => {
    this.carouselIndex = index;
  };

  // Search actions
  setSearchQuery = (query: string): void => {
    this.searchQuery = query;
  };

  // Reset all post data
  resetPostData = (): void => {
    this.formValues = {
      title: '',
      description: '',
      type: 'project',
      tagIds: [],
      cityId: '',
    };
    this.collaborators = [];
    this.needs = [];
    this.carouselIndex = 0;
    this.searchQuery = '';
  };
}
