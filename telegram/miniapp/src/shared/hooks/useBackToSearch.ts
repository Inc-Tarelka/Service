import { useNavigate, useSearchParams } from 'react-router-dom';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackButton } from './useBackButton';

export const useBackToSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('query') || '';
  const tab = searchParams.get('tab') || '';

  useBackButton({
    onBack: () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (tab) params.set('tab', tab);
      navigate(`${RoutePath.main}?${params.toString()}`);
    },
  });
};
