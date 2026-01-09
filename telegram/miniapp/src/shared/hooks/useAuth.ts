import WebApp from '@twa-dev/sdk';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAccessToken, setAccessToken } from 'shared/api/base';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      let tokenValue = '';

      // 1. Проверяем CloudStorage
      if (
        WebApp.CloudStorage &&
        (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
      ) {
        try {
          tokenValue = await new Promise((resolve) => {
            WebApp.CloudStorage.getItem('access_token', (error, token) => {
              if (error) resolve('');
              else resolve(token || '');
            });
          });
        } catch (e) {
          console.error('CloudStorage error:', e);
        }
      }

      // 2. Если в CloudStorage пусто, проверяем localStorage
      if (!tokenValue) {
        tokenValue = localStorage.getItem('access_token') || '';
      }

      if (tokenValue !== '') {
        if (location.pathname === RoutePath.auth) {
          navigate(RoutePath.main);
        }
        setIsAuthenticated(true);
      } else {
        if (
          location.pathname !== RoutePath.auth &&
          location.pathname !== RoutePath.welcome
        ) {
          navigate(RoutePath.auth);
        }
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  return {
    isAuthenticated,
    setToken: (token: string) => {
      setAccessToken(token);
      setIsAuthenticated(true);
      navigate(RoutePath.main);
    },
    logout: () => {
      clearAccessToken();
      setIsAuthenticated(false);
      navigate(RoutePath.welcome);
    },
  };
};
