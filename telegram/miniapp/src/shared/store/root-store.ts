import { authStore } from './api/Auth/auth-store';
import { SearchInteractionsStore } from './api/Interaction/search-interactions-store';
import { PostStore } from './api/Post/post-store';
import { PublicationDetailsStore } from './api/Publication/publication-details-store';
import { PublicationStore } from './api/Publication/publication-store';
import { SearchPublicationStore } from './api/Publication/search-publication-store';
import { SearchNeedsStore } from './api/PublicationNeedsSearch/search-needs-store';
import { SearchServicesStore } from './api/PublicationServicesSearch/search-services-store';
import { ReferenceStore } from './api/Reference/reference-store';
import { UserProfileStore } from './api/User/user-profile-store';
import { UserStore } from './api/User/user-store';
import { SearchUsersStore } from './api/UserSearch/search-users-store';
import { GalleryStore } from './gallery-store';
import { ScrollRecoveryStore } from './interactions/scroll-recovery-store';
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
  publicationDetailsStore = new PublicationDetailsStore();
  searchPublicationStore = new SearchPublicationStore();
  searchNeedsStore = new SearchNeedsStore();
  searchServicesStore = new SearchServicesStore();
  searchUsersStore = new SearchUsersStore();
  searchInteractionsStore = new SearchInteractionsStore(this);
  scrollRecoveryStore = new ScrollRecoveryStore();
}
