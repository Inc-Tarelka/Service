import {
  NeedListingList,
  ProfileListingList,
  ServiceListingList,
} from 'entities/search-listing';
import { observer } from 'mobx-react-lite';
import { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { SearchUser } from 'shared/api/service/UserSearch';
import { SearchPublicationsType } from 'shared/api/types';

interface ListingContentProps {
  activeTab: SearchPublicationsType;
  needs?: SearchNeedItem[];
  services?: SearchServiceItem[];
  users?: SearchUser[];
  isLoading: boolean;
  isLoaded: boolean;
  onItemClick: (id: number) => void;
}

export const ListingContent = observer(
  ({
    activeTab,
    needs = [],
    services = [],
    users = [],
    isLoading,
    isLoaded,
    onItemClick,
  }: ListingContentProps) => {
    if (!isLoaded && !isLoading) {
      return null;
    }

    switch (activeTab) {
      case SearchPublicationsType.PROFILE:
        return (
          <ProfileListingList
            users={users}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.SERVICE:
        return (
          <ServiceListingList
            services={services}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.NEED:
        return (
          <NeedListingList
            needs={needs}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  },
);
