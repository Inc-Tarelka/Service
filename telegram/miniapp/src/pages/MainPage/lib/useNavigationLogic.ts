import { useNavigate } from 'react-router-dom';
import { SearchPublication } from 'shared/api/service/Publication';
import { SearchPublicationsType } from 'shared/api/types';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useStore } from 'app/StoreProvider';

export const useNavigationLogic = () => {
  const { userStore } = useStore();
  const navigate = useNavigate();

  const handleDataNavigation = (
    id: number,
    activeTab: SearchPublicationsType,
    publications: SearchPublication[],
    currentSearchQuery: string,
  ) => {
    const publication = publications.find((pub) => pub.id === id);

    if (publication && activeTab === SearchPublicationsType.PROFILE) {
      const currentUserId = userStore.profile?.id;
      const isOwnProfile =
        currentUserId && String(currentUserId) === String(publication.authorId);

      const searchState = new URLSearchParams();
      if (currentSearchQuery) {
        searchState.set('query', currentSearchQuery);
      }
      searchState.set('tab', activeTab);

      if (isOwnProfile) {
        navigate(`${RoutePath[AppRoutes.PROFILE]}?${searchState.toString()}`);
      } else {
        navigate(
          `${RoutePath[AppRoutes.USER_PROFILE].replace(':id', String(publication.authorId))}?${searchState.toString()}`,
        );
      }
    } else {
      console.log('Clicked publication:', id);
    }
  };

  return { handleDataNavigation };
};
