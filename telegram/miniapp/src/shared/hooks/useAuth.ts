import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAccessToken } from 'shared/api/base';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { authStore } from 'shared/store/api/Auth/auth-store';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authStore.isAuth) {
      if (location.pathname === RoutePath.auth) {
        navigate(RoutePath.main);
      }
    } else {
      if (
        location.pathname !== RoutePath.auth &&
        location.pathname !== RoutePath.welcome
      ) {
        navigate(RoutePath.auth);
      }
    }
  }, [navigate, location.pathname, authStore.isAuth]);

  return {
    isAuthenticated: authStore.isAuth,
    setToken: (token: string) => {
      setAccessToken(token);
      authStore.isAuth = true;
      navigate(RoutePath.main);
    },
    logout: () => {
      authStore.logoutAction();
      navigate(RoutePath.welcome);
    },
  };
};
