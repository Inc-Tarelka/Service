import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useStore } from 'app/StoreProvider';
import { ServiceListingDetails } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetails';
import { ServiceListingDetailsSkeleton } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetailsSkeleton';
import { ServiceCommentsDrawer } from 'features/post/ui/ServiceCommentsDrawer/ServiceCommentsDrawer';
import { ResponseToNeedDrawer } from 'features/respond-to-need/ui/ResponseToNeedDrawer/ResponseToNeedDrawer';
import { NeedDetailsDrawer } from 'features/view-need/ui/NeedDetailsDrawer/NeedDetailsDrawer';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { useBackButton } from 'shared/hooks/useBackButton';
import { buildServiceStartAppLink } from 'shared/lib/utils/telegram-startapp';
import { MOCK_SERVICE_DETAIL } from 'shared/mocks/serviceDetailMocks';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { Page } from 'widgets/Page';
import s from './ServiceDetailPage.module.scss';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';

export const ServiceDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { publicationDetailsStore, userStore, authStore } = useStore();

  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [responseOpened, setResponseOpened] = useState(false);
  const [responseReceiverId, setResponseReceiverId] = useState<number | null>(
    null,
  );

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
    if (!authStore.isAuth) {
      return;
    }
    publicationDetailsStore.toggleLikeAction(publicationId);
  };

  const handleShare = (publicationId: number) => {
    const shareLink = buildServiceStartAppLink(publicationId);
    const shareText = service.name
      ? `${service.name} в Tarelka`
      : 'Смотри пост в Tarelka';

    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      shareLink,
    )}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
      return;
    }

    window.open(telegramShareUrl, '_blank');
  };

  const currentUserId = userStore.profile?.id;
  const isOwner =
    !!currentUserId && String(currentUserId) === String(storeService?.authorId);
  const isViewOnly = !authStore.isAuth;

  const handleEditClick = () => {
    if (id) {
      navigate(RoutePath[AppRoutes.EDIT_POST].replace(':id', id));
    }
  };

  const handleTeamMemberClick = (userId: number) => {
    if (!authStore.isAuth) {
      return;
    }

    const currentUserId = userStore.profile?.id;
    const isOwner = currentUserId && String(currentUserId) === String(userId);

    const searchState = new URLSearchParams();
    searchState.set('tab', 'profile');

    if (isOwner) {
      navigate(`${RoutePath[AppRoutes.PROFILE]}?${searchState.toString()}`);
    } else {
      navigate(
        `${RoutePath[AppRoutes.USER_PROFILE].replace(':id', String(userId))}?${searchState.toString()}`,
      );
    }
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
        onCommentClick={!isViewOnly ? () => setCommentsOpened(true) : undefined}
        onNeedClick={
          !isViewOnly
            ? (needId: number) => setSelectedNeedId(needId)
            : undefined
        }
        onLike={!isViewOnly ? handleLike : undefined}
        onTeamMemberClick={!isViewOnly ? handleTeamMemberClick : undefined}
        isOwner={isOwner}
        onEdit={handleEditClick}
        onShare={handleShare}
        isViewOnly={isViewOnly}
      />
      {!isViewOnly && (
        <ServiceCommentsDrawer
          opened={commentsOpened}
          onClose={() => setCommentsOpened(false)}
          publicationId={service.id}
        />
      )}
      {!isViewOnly && (
        <NeedDetailsDrawer
          opened={!!selectedNeedId && !responseOpened}
          onClose={() => setSelectedNeedId(null)}
          onRespond={(receiverId) => {
            setResponseReceiverId(receiverId);
            setResponseOpened(true);
          }}
          needId={selectedNeedId}
          receiverId={storeService?.authorId ?? null}
        />
      )}
      {!isViewOnly && (
        <ResponseToNeedDrawer
          opened={responseOpened}
          onClose={() => {
            setResponseOpened(false);
            setSelectedNeedId(null);
            setResponseReceiverId(null);
          }}
          onBack={() => setResponseOpened(false)}
          needId={selectedNeedId}
          receiverId={responseReceiverId}
        />
      )}
    </Page>
  );
});

export default ServiceDetailPage;
