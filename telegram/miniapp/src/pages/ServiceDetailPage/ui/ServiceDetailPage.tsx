import { ServiceListingDetails } from 'entities/search-listing/ui/ServiceListing/ServiceListingDetails/ServiceListingDetails';
import { ServiceCommentsDrawer } from 'features/post/ui/ServiceCommentsDrawer/ServiceCommentsDrawer';
import { ResponseToNeedDrawer } from 'features/respond-to-need/ui/ResponseToNeedDrawer/ResponseToNeedDrawer';
import { NeedDetailsDrawer } from 'features/view-need/ui/NeedDetailsDrawer/NeedDetailsDrawer';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { SearchServiceItem } from 'shared/api/service/PublicationServicesSearch';
import { useBackButton } from 'shared/hooks/useBackButton';
import {
  MOCK_COMMENTS,
  MOCK_SERVICE_DETAIL,
} from 'shared/mocks/serviceDetailMocks';
import { Page } from 'widgets/Page';
import s from './ServiceDetailPage.module.scss';

export const ServiceDetailPage = () => {
  const location = useLocation();
  const service =
    (location.state?.service as SearchServiceItem) || MOCK_SERVICE_DETAIL;
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [responseOpened, setResponseOpened] = useState(false);

  useBackButton();

  if (!service) {
    return <div className={s.page}>Service not found</div>;
  }

  const mockNeedData = {
    title: 'Требуется дизайнер UI/UX',
    description:
      'Ищем опытного дизайнера для создания интерфейса мобильного приложения. Проект рассчитан на 2-3 месяца работы.',
    tags: 'Дизайн, UI/UX, Figma',
    deadline: '01.03.2026 - 31.05.2026',
    budget: 150000,
  };

  return (
    <Page>
      <ServiceListingDetails
        service={service}
        onCommentClick={() => setCommentsOpened(true)}
        onNeedClick={(id: number) => setSelectedNeedId(id)}
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
        needData={mockNeedData}
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
};

export default ServiceDetailPage;
