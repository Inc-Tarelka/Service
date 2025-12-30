import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { setAccessToken, clearAccessToken } from 'shared/api/base';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      WebApp.CloudStorage &&
      (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
    ) {
      WebApp.CloudStorage.getItem('access_token', (error, token) => {
        if (error) {
          console.error('Ошибка получения токена:', error);
          return;
        }

        if (token !== '') {
          if (
            location.pathname === RoutePath.welcome 
            // location.pathname === RoutePath.auth
          ) {
            navigate(RoutePath.main);
          }
          setIsAuthenticated(true);
        } else {
          if (
            location.pathname !== RoutePath.welcome 
            // location.pathname !== RoutePath.auth
          ) {
            navigate(RoutePath.welcome);
          }
          setIsAuthenticated(false);
        }
      });
    }
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
