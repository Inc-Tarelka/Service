import { makeAutoObservable } from 'mobx';
import {
  createPublicationComment,
  getPublicationComments,
} from 'shared/api/service/Publication/api';
import type { PublicationComment } from 'shared/api/service/Publication/types';
import type { RootStore } from '../../root-store';

export class PublicationCommentsStore {
  commentsByPublication: Record<number, PublicationComment[]> = {};
  totalByPublication: Record<number, number> = {};
  isLoadingByPublication: Record<number, boolean> = {};

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  getCommentsAction = async (publicationId: number) => {
    if (this.isLoadingByPublication[publicationId]) {
      return;
    }

    this.isLoadingByPublication[publicationId] = true;
    try {
      const response = await getPublicationComments(publicationId);
      this.commentsByPublication[publicationId] = response.comments;
      this.totalByPublication[publicationId] = response.total;
    } catch (error) {
      console.error('Failed to fetch publication comments:', error);
    } finally {
      this.isLoadingByPublication[publicationId] = false;
    }
  };

  createCommentAction = async (
    publicationId: number,
    content: string,
    parentCommentId?: number,
  ) => {
    if (!this.commentsByPublication[publicationId]) {
      this.commentsByPublication[publicationId] = [];
    }

    const tempId = -Date.now();

    const userProfile = this.rootStore.userStore.profile;

    const newComment: PublicationComment = {
      id: tempId,
      authorId: Number(userProfile?.id) || 0,
      authorFirstName: 'Вы',
      authorLastName: '',
      content: content,
      createdAt: new Date().toISOString(),
      parentCommentId,
    };

    this.commentsByPublication[publicationId] = [
      newComment,
      ...this.commentsByPublication[publicationId],
    ];
    this.totalByPublication[publicationId] =
      (this.totalByPublication[publicationId] || 0) + 1;

    try {
      const response = await createPublicationComment(publicationId, {
        content,
        parentCommentId,
      });
      const tempIndex = this.commentsByPublication[publicationId].findIndex(
        (c) => c.id === tempId,
      );
      if (tempIndex !== -1) {
        this.commentsByPublication[publicationId][tempIndex] = response;
      }
    } catch (error) {
      console.error('Failed to create publication comment:', error);
      this.commentsByPublication[publicationId] = this.commentsByPublication[
        publicationId
      ].filter((c) => c.id !== tempId);
      this.totalByPublication[publicationId] =
        (this.totalByPublication[publicationId] || 1) - 1;
    } finally {
      this.isLoadingByPublication[publicationId] = false;
    }
  };

  getComments(publicationId: number): PublicationComment[] {
    return this.commentsByPublication[publicationId] || [];
  }
}
