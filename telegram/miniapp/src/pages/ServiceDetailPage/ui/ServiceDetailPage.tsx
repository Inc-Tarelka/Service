import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useStore } from 'app/StoreProvider';
import { ServiceListingDetails } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetails';
import { ServiceListingDetailsSkeleton } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetailsSkeleton';
import { ServiceCommentsDrawer } from 'features/post/ui/ServiceCommentsDrawer/ServiceCommentsDrawer';
import { ResponseToNeedDrawer } from 'features/respond-to-need/ui/ResponseToNeedDrawer/ResponseToNeedDrawer';
import { NeedDetailsDrawer } from 'features/view-need/ui/NeedDetailsDrawer/NeedDetailsDrawer';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { useBackButton } from 'shared/hooks/useBackButton';
import {
  MOCK_COMMENTS,
  MOCK_SERVICE_DETAIL,
} from 'shared/mocks/serviceDetailMocks';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { Page } from 'widgets/Page';
import s from './ServiceDetailPage.module.scss';

export const ServiceDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { publicationDetailsStore } = useStore();

  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [responseOpened, setResponseOpened] = useState(false);

  useBackButton();

  useEffect(() => {
    referenceStore.getCitiesAction();
  }, []);

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      publicationDetailsStore.getPublicationDetailsAction(Number(id));
    }
  }, [id, publicationDetailsStore]);

  const isLoading = publicationDetailsStore.isLoading;
  const error = publicationDetailsStore.error;
  const storeService = publicationDetailsStore.data?.publication;

  const service =
    (storeService as unknown as SearchServiceItem) ||
    (location.state?.service as SearchServiceItem) ||
    MOCK_SERVICE_DETAIL;

  const cityName =
    referenceStore.cities.find((city) => city.id === service?.cityId)?.name ??
    service?.cityId?.toString();

  const handleLike = (publicationId: number) => {
    publicationDetailsStore.toggleLikeAction(publicationId);
  };

  if (isLoading) {
    return (
      <Page disableScrollRecovery>
        <ServiceListingDetailsSkeleton />
      </Page>
    );
  }

  if (error) {
    return (
      <Page disableScrollRecovery>
        <div className={s.page}>Failed to load publication details.</div>
      </Page>
    );
  }

  if (!service) {
    return <div className={s.page}>Service not found</div>;
  }

  return (
    <Page disableScrollRecovery>
      <ServiceListingDetails
        service={service}
        cityName={cityName}
        team={publicationDetailsStore.data?.team}
        needs={publicationDetailsStore.data?.needs}
        onCommentClick={() => setCommentsOpened(true)}
        onNeedClick={(needId: number) => setSelectedNeedId(needId)}
        onLike={handleLike}
      />
      <ServiceCommentsDrawer
        opened={commentsOpened}
        onClose={() => setCommentsOpened(false)}
        comments={MOCK_COMMENTS}
      />
      <NeedDetailsDrawer
        opened={!!selectedNeedId && !responseOpened}
        onClose={() => setSelectedNeedId(null)}
        onRespond={() => setResponseOpened(true)}
        needId={selectedNeedId}
      />
      <ResponseToNeedDrawer
        opened={responseOpened}
        onClose={() => {
          setResponseOpened(false);
          setSelectedNeedId(null);
        }}
        onBack={() => setResponseOpened(false)}
      />
    </Page>
  );
});

export default ServiceDetailPage;
