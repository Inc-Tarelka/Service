import {
  NeedListingList,
  ProfileListingList,
  ServiceListingList,
} from 'entities/search-listing';
import { Loader } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { SearchNeedItem } from 'shared/api/service/PublicationNeedsSearch';
import { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import type { SearchAllItem } from 'shared/api/service/SearchAll';
import { SearchUser } from 'shared/api/service/UserSearch';
import { SearchPublicationsType } from 'shared/api/types';
import { NeedListingItem } from 'entities/search-listing/ui/NeedListing/NeedListingItem/NeedListingItem';
import { ProfileListingItem } from 'entities/search-listing/ui/ProfileListing/ProfileListingItem/ProfileListingItem';
import { ServiceListingItem } from 'entities/search-listing/ui/ServiceListing/ServiceListingItem/ServiceListingItem';

interface ListingContentProps {
  activeTab: SearchPublicationsType;
  needs?: SearchNeedItem[];
  services?: SearchServiceItem[];
  users?: SearchUser[];
  allItems?: SearchAllItem[];
  allNeeds?: SearchNeedItem[];
  allServices?: SearchServiceItem[];
  allUsers?: SearchUser[];
  isLoading: boolean;
  isLoadingMoreProfiles?: boolean;
  isLoadingMoreServices?: boolean;
  isLoadingMoreNeeds?: boolean;
  isLoaded: boolean;
  onAllNeedClick?: (id: number) => void;
  onAllServiceClick?: (id: number) => void;
  onAllProfileClick?: (id: number) => void;
  onItemClick: (id: number) => void;
}

export const ListingContent = observer((params: ListingContentProps) => {
  const {
    activeTab,
    needs = [],
    services = [],
    users = [],
    allItems = [],
    allNeeds = [],
    allServices = [],
    allUsers = [],
    isLoading,
    isLoadingMoreProfiles,
    isLoadingMoreServices,
    isLoadingMoreNeeds,
    isLoaded,
    onAllNeedClick,
    onAllServiceClick,
    onAllProfileClick,
    onItemClick,
  } = params;
  if (!isLoaded && !isLoading) {
    return null;
  }

  switch (activeTab) {
    case SearchPublicationsType.ALL:
      if (isLoading) {
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px 0',
            }}
          >
            <Loader color="var(--accent-color)" />
          </div>
        );
      }

      if (
        allNeeds.length === 0 &&
        allServices.length === 0 &&
        allUsers.length === 0
      ) {
        return (
          <div
            style={{
              padding: '24px 16px',
              color: 'var(--text-color-secondary)',
            }}
          >
            Ничего не найдено
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allItems.map((item) => {
            if (item.type === 'service') {
              const service = allServices.find((entry) => entry.id === item.id);
              if (!service) return null;
              return (
                <ServiceListingItem
                  key={`service-${item.id}`}
                  service={service}
                  onClick={onAllServiceClick}
                />
              );
            }

            if (item.type === 'need') {
              const need = allNeeds.find((entry) => entry.id === item.id);
              if (!need) return null;
              return (
                <NeedListingItem
                  key={`need-${item.id}`}
                  need={need}
                  onClick={onAllNeedClick}
                />
              );
            }

            if (item.type === 'profile') {
              const user = allUsers.find((entry) => entry.id === item.id);
              if (!user) return null;
              return (
                <ProfileListingItem
                  key={`profile-${item.id}`}
                  user={user}
                  onClick={onAllProfileClick}
                />
              );
            }

            return null;
          })}
        </div>
      );
    case SearchPublicationsType.PROFILE:
      return (
        <ProfileListingList
          users={users}
          onItemClick={onItemClick}
          isLoading={isLoading}
          isLoadingMore={isLoadingMoreProfiles}
        />
      );
    case SearchPublicationsType.SERVICE:
      return (
        <ServiceListingList
          services={services}
          onItemClick={onItemClick}
          isLoading={isLoading}
          isLoadingMore={isLoadingMoreServices}
        />
      );
    case SearchPublicationsType.NEED:
      return (
        <NeedListingList
          needs={needs}
          onItemClick={onItemClick}
          isLoading={isLoading}
          isLoadingMore={isLoadingMoreNeeds}
        />
      );
    default:
      return null;
  }
});
