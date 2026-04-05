import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator';
import { CollaboratorsListSkeleton } from 'entities/collaborator/ui/CollaboratorsList/CollaboratorsList.skeleton';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBackButton } from 'shared/hooks/useBackButton';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { MOCK_OUTGOING_REQUESTS } from 'shared/mocks/collaboratorMocks';
import { TabItem, TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page';

type CollaboratorTab = 'collaborators' | 'outgoing';

const TABS: TabItem<CollaboratorTab>[] = [
  { label: 'Сокомандники', value: 'collaborators' },
  { label: 'Исходящие запросы', value: 'outgoing' },
];

export const CollaboratorsPage = observer(() => {
  useBackButton();
  const { userStore } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as CollaboratorTab | null;
  const [activeTab, setActiveTab] = useState<CollaboratorTab>(
    tabFromUrl === 'outgoing' ? 'outgoing' : 'collaborators',
  );

  const teammates = userStore.teammates;
  const isLoadingTeammates = userStore.isLoadingTeammates;

  useEffect(() => {
    userStore.getTeammatesAction();
  }, []);

  useEffect(() => {
    if (
      tabFromUrl &&
      (tabFromUrl === 'collaborators' || tabFromUrl === 'outgoing')
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: CollaboratorTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const handleItemClick = (id: string) => {
    navigate(RoutePath.user_profile.replace(':id', id));
  };

  return (
    <Page>
      <TabsSwitcher
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hideMask
        renderTab={(tab) => {
          switch (tab) {
            case 'collaborators':
              return isLoadingTeammates ? (
                <CollaboratorsListSkeleton />
              ) : (
                <CollaboratorsList
                  collaborators={teammates}
                  onItemClick={handleItemClick}
                />
              );
            case 'outgoing':
              return (
                <CollaboratorsList
                  collaborators={MOCK_OUTGOING_REQUESTS}
                  onItemClick={handleItemClick}
                />
              );
            default:
              return null;
          }
        }}
      />
    </Page>
  );
});
export default CollaboratorsPage;
