import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useStore } from 'app/StoreProvider';
import { ServiceListingDetails } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetails';
import { ServiceListingDetailsSkeleton } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetailsSkeleton';
import { ServiceCommentsDrawer } from 'features/post/ui/ServiceCommentsDrawer/ServiceCommentsDrawer';
import { ResponseToNeedDrawer } from 'features/respond-to-need/ui/ResponseToNeedDrawer/ResponseToNeedDrawer';
import { NeedDetailsDrawer } from 'features/view-need/ui/NeedDetailsDrawer/NeedDetailsDrawer';
import { getNotificationById } from 'shared/api/service/Notification/api';
import type { Notification } from 'shared/api/service/Notification/types';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { useBackButton } from 'shared/hooks/useBackButton';
import { buildServiceStartAppLink } from 'shared/lib/utils/telegram-startapp';
import { MOCK_SERVICE_DETAIL } from 'shared/mocks/serviceDetailMocks';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { ErrorPage } from 'widgets/ErrorPage/ui/ErrorPage';
import { Page } from 'widgets/Page';
import { AppRoutes, RoutePath } from 'shared/config/routeConfig/routeConfig';

interface TeamInviteContext {
  notificationId: number;
  publicationId: number;
  senderName: string;
}

export const ServiceDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { publicationDetailsStore, userStore, authStore, notificationsStore } =
    useStore();

  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [responseOpened, setResponseOpened] = useState(false);
  const [responseReceiverId, setResponseReceiverId] = useState<number | null>(
    null,
  );
  const [teamInviteContext, setTeamInviteContext] =
    useState<TeamInviteContext | null>(null);

  useBackButton();

  useEffect(() => {
    referenceStore.getCitiesAction();
  }, []);

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      publicationDetailsStore.getPublicationDetailsAction(Number(id));
    }
  }, [id, publicationDetailsStore]);

  const inviteIdFromQuery = Number(
    new URLSearchParams(location.search).get('teamInviteNotificationId'),
  );

  const clearTeamInviteQuery = useCallback(() => {
    setSearchParams(
      (previousParams) => {
        const next = new URLSearchParams(previousParams);
        next.delete('teamInviteNotificationId');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  useEffect(() => {
    let isCancelled = false;

    const applyContextFromNotification = (notification: Notification) => {
      const isPendingInvite =
        notification.type === 'TeamInvite' &&
        !notification.isDeleted &&
        (notification.isApprove === null ||
          notification.isApprove === undefined);

      if (!isPendingInvite) {
        setTeamInviteContext((previous) => (previous ? null : previous));
        clearTeamInviteQuery();
        return;
      }

      const senderName = notification.initiator
        ? `${notification.initiator.firstName ?? ''} ${notification.initiator.lastName ?? ''}`.trim()
        : notification.creatorName;
      const nextContext: TeamInviteContext = {
        notificationId: notification.id,
        publicationId: notification.publicationId,
        senderName: senderName || 'Пользователь',
      };

      setTeamInviteContext((previous) => {
        if (
          previous?.notificationId === nextContext.notificationId &&
          previous.publicationId === nextContext.publicationId &&
          previous.senderName === nextContext.senderName
        ) {
          return previous;
        }

        return nextContext;
      });
    };

    if (!Number.isFinite(inviteIdFromQuery) || inviteIdFromQuery <= 0) {
      setTeamInviteContext((previous) => (previous ? null : previous));
      return () => {
        isCancelled = true;
      };
    }

    if (teamInviteContext?.notificationId === inviteIdFromQuery) {
      return () => {
        isCancelled = true;
      };
    }

    const fetchInviteContext = async () => {
      try {
        const notification = await getNotificationById(inviteIdFromQuery);
        if (isCancelled) return;
        applyContextFromNotification(notification);
      } catch (error) {
        console.error('Failed to fetch team invite context by id:', error);
      }
    };

    void fetchInviteContext();

    return () => {
      isCancelled = true;
    };
  }, [
    inviteIdFromQuery,
    teamInviteContext?.notificationId,
    clearTeamInviteQuery,
  ]);

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

  const handleRespondTeamInvite = async (
    notificationId: number,
    isApprove: boolean,
  ) => {
    const success = await notificationsStore.respondTeamInviteAction(
      notificationId,
      isApprove,
    );

    if (!success) {
      return;
    }

    setTeamInviteContext(null);
    clearTeamInviteQuery();
  };

  const shouldShowTeamInviteBanner =
    !isViewOnly &&
    Boolean(teamInviteContext) &&
    Number(teamInviteContext?.publicationId) === Number(service?.id);

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
    return <ErrorPage />;
  }

  if (!service) {
    return <ErrorPage />;
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
        teamInviteBanner={
          shouldShowTeamInviteBanner && teamInviteContext
            ? {
                senderName: teamInviteContext.senderName,
                notificationId: teamInviteContext.notificationId,
                isResponding: notificationsStore.isRespondingInvite,
                onAccept: (notificationId) => {
                  void handleRespondTeamInvite(notificationId, true);
                },
                onDecline: (notificationId) => {
                  void handleRespondTeamInvite(notificationId, false);
                },
              }
            : null
        }
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
