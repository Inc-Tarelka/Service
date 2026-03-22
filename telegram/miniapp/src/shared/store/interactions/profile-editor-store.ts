import { makeAutoObservable } from 'mobx';

export class ProfileEditorStore {
  avatarActionsOpened = false;
  coverActionsOpened = false;
  avatarEditorOpened = false;
  coverEditorOpened = false;
  avatarAutoOpen = false;
  coverAutoOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  openAvatarActions = () => {
    this.avatarActionsOpened = true;
  };

  closeAvatarActions = () => {
    this.avatarActionsOpened = false;
  };

  openCoverActions = () => {
    this.coverActionsOpened = true;
  };

  closeCoverActions = () => {
    this.coverActionsOpened = false;
  };

  openAvatarEditor = (autoOpen = false) => {
    this.avatarAutoOpen = autoOpen;
    this.avatarEditorOpened = true;
  };

  closeAvatarEditor = () => {
    this.avatarEditorOpened = false;
    this.avatarAutoOpen = false;
  };

  openCoverEditor = (autoOpen = false) => {
    this.coverAutoOpen = autoOpen;
    this.coverEditorOpened = true;
  };

  closeCoverEditor = () => {
    this.coverEditorOpened = false;
    this.coverAutoOpen = false;
  };
}
