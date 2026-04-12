import { useEffect, useRef } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { setAccessToken } from 'shared/api/base';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import {
  buildSharedServiceRoute,
  getTelegramStartParam,
  parseTelegramStartParam,
} from 'shared/lib/utils/telegram-startapp';
import { authStore } from 'shared/store/api/Auth/auth-store';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handledStartParamRef = useRef<string | null>(null);

  useEffect(() => {
    const parsedStartParam = parseTelegramStartParam(getTelegramStartParam());

    if (
      parsedStartParam?.type === 'service' &&
      parsedStartParam.raw !== handledStartParamRef.current
    ) {
      handledStartParamRef.current = parsedStartParam.raw;
      navigate(buildSharedServiceRoute(parsedStartParam.publicationId), {
        replace: true,
      });
      return;
    }

    const isServiceDetailRoute = !!matchPath(
      RoutePath.service_detail,
      location.pathname,
    );

    if (authStore.isAuth) {
      if (location.pathname === RoutePath.auth) {
        navigate(RoutePath.main);
      }
    } else {
      if (
        location.pathname !== RoutePath.auth &&
        location.pathname !== RoutePath.welcome &&
        !isServiceDetailRoute
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
