import { authStore } from './api/Auth/auth-store';
import { PostStore } from './api/Post/post-store';
import { PublicationStore } from './api/Publication/publication-store';
import { SearchPublicationStore } from './api/Publication/search-publication-store';
import { ReferenceStore } from './api/Reference/reference-store';
import { UserProfileStore } from './api/User/user-profile-store';
import { UserStore } from './api/User/user-store';
import { GalleryStore } from './gallery-store';
import { ViewportStore } from './viewport-store';
import { WebAppStore } from './web-app-store';

export class RootStore {
  webAppStore = new WebAppStore();
  viewportStore = new ViewportStore();
  authStore = authStore;
  referenceStore = new ReferenceStore();
  galleryStore = new GalleryStore();
  userStore = new UserStore();
  userProfileStore = new UserProfileStore();
  postStore = new PostStore();
  publicationStore = new PublicationStore();
  searchPublicationStore = new SearchPublicationStore();
}
