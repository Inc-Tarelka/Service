import { CollaboratorsList } from 'entities/collaborator';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBackButton } from 'shared/hooks/useBackButton';
import {
  MOCK_COLLABORATORS,
  MOCK_OUTGOING_REQUESTS,
} from 'shared/mocks/collaboratorMocks';
import { TabItem, TabsSwitcher } from 'shared/ui/TabsSwitcher/TabsSwitcher';
import { Page } from 'widgets/Page';

type CollaboratorTab = 'collaborators' | 'outgoing';

const TABS: TabItem<CollaboratorTab>[] = [
  { label: 'Сокомандники', value: 'collaborators' },
  { label: 'Исходящие запросы', value: 'outgoing' },
];

export const CollaboratorsPage = () => {
  useBackButton();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as CollaboratorTab | null;
  const [activeTab, setActiveTab] = useState<CollaboratorTab>(
    tabFromUrl === 'outgoing' ? 'outgoing' : 'collaborators',
  );

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
    console.log('Clicked collaborator:', id);
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
              return (
                <CollaboratorsList
                  collaborators={MOCK_COLLABORATORS}
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
};
export default CollaboratorsPage;
