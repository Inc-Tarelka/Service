import {
  NeedListingList,
  ProfileListingList,
  ServiceListingList,
} from 'entities/search-listing';
import { observer } from 'mobx-react-lite';
import { SearchPublication } from 'shared/api/service/Publication';
import { SearchPublicationsType } from 'shared/api/types';

interface ListingContentProps {
  activeTab: SearchPublicationsType;
  publications: SearchPublication[];
  isLoading: boolean;
  isLoaded: boolean;
  onItemClick: (id: number) => void;
}

export const ListingContent = observer(
  ({
    activeTab,
    publications,
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
            publications={publications}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.SERVICE:
        return (
          <ServiceListingList
            publications={publications}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      case SearchPublicationsType.NEED:
        return (
          <NeedListingList
            publications={publications}
            onItemClick={onItemClick}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  },
);
