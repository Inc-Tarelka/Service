import WebApp from '@twa-dev/sdk';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

let cachedToken: string | undefined = undefined;
let cachedRefreshToken: string | undefined = undefined;

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

let isServerDown = false;
let serverDownTimestamp = 0;

/**
 * очередь запросов после обновления токена
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) {
        prom.config.headers.Authorization = `Bearer ${token}`;
        (prom.config as any)._retry = true;
      }
      baseInstanceV1(prom.config).then(prom.resolve).catch(prom.reject);
    }
  });
  failedQueue = [];
};

/**
 * (один раз при старте).
 */
export const loadTokensOnce = async (): Promise<void> => {
  try {
    if (
      WebApp.CloudStorage &&
      typeof WebApp.CloudStorage.getItems === 'function' &&
      (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
    ) {
      const items: any = await new Promise((resolve, reject) => {
        WebApp.CloudStorage.getItems(
          ['access_token', 'refresh_token'],
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
      });

      const accessToken = items?.['access_token'];
      const refreshToken = items?.['refresh_token'];

      if (accessToken) cachedToken = accessToken;
      if (refreshToken) cachedRefreshToken = refreshToken;
    }
  } catch (error) {
    console.error('Error loading tokens:', error);
  }
};

export const loadAccessTokenOnce = loadTokensOnce;

export const getAccessToken = () => cachedToken;
export const getRefreshToken = () => cachedRefreshToken;

export const setAccessToken = (token: string | undefined) => {
  cachedToken = token;

  if (
    token &&
    WebApp.CloudStorage &&
    (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
  ) {
    WebApp.CloudStorage.setItem('access_token', token, (error) => {
      if (error) {
        console.error('Error saving access token to CloudStorage:', error);
      }
    });
  }
};

export const setRefreshToken = (token: string | undefined) => {
  cachedRefreshToken = token;

  if (
    token &&
    WebApp.CloudStorage &&
    (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
  ) {
    WebApp.CloudStorage.setItem('refresh_token', token, (error) => {
      if (error) {
        console.error('Error saving refresh token to CloudStorage:', error);
      }
    });
  }
};

export const clearTokens = () => {
  cachedToken = undefined;
  cachedRefreshToken = undefined;

  if (
    WebApp.CloudStorage &&
    (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
  ) {
    WebApp.CloudStorage.removeItems(
      ['access_token', 'refresh_token'],
      (error) => {
        if (error) {
          console.error('Error removing tokens from CloudStorage:', error);
        }
      },
    );
  }
};

export const clearAccessToken = clearTokens;

export const isServerAvailable = (): boolean => {
  if (!isServerDown) return true;

  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() - serverDownTimestamp > fiveMinutes) {
    isServerDown = false;
    return true;
  }

  return false;
};

export const getServerStatus = () => ({
  isDown: isServerDown,
  downSince: serverDownTimestamp,
  timeSinceDown: Date.now() - serverDownTimestamp,
});

/**
 * Нормализует baseURL, добавляя /v1 если его нет
 */
function normalizeBaseURL(baseURL: string | undefined): string {
  if (!baseURL) return '';
  const url = baseURL.trim();
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  if (cleanUrl.endsWith('/v1') || cleanUrl.includes('/v1/')) {
    return cleanUrl;
  }
  return `${cleanUrl}/v1`;
}

/**
 * Инстанс с авторизацией (для всех запросов после логина).
 */
function createPrivateInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: normalizeBaseURL(import.meta.env.VITE_BASE_URL),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cachedToken}`,
    },
  });

  // ==== Interceptor запросов ====
  instance.interceptors.request.use(
    (config) => {
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ==== Interceptor ответов ====
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // 1. Обработка 401 (Unauthorized) - Refresh Token
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Если обновление уже идет, добавляем запрос в очередь
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Динамический импорт для избежания циклической зависимости
          const { refreshRequest } = await import(
            'shared/api/service/Auth/api'
          );

          const response = await refreshRequest({ refreshToken: refreshToken });

          if (response?.accessToken) {
            const { accessToken, refreshToken: newRefreshToken } = response;

            // Сохраняем новые токены
            setAccessToken(accessToken);
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }

            // Обновляем текущий запрос
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Обрабатываем очередь
            processQueue(null, accessToken);

            return instance(originalRequest);
          } else {
            throw new Error('Invalid response from refresh');
          }
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          clearTokens();
          window.location.href = RoutePath.auth;
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 2. Обработка 403 (Server Down / Forbidden)
      if (error.response?.status === 403) {
        // Логируем только важное событие - проблемы с пулом соединений сервера
        console.error('403 Forbidden - server connection pool issue');

        isServerDown = true;
        serverDownTimestamp = Date.now();

        const retryCount = (error.config as any)?.['__retryCount'] || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          (error.config as any)['__retryCount'] = retryCount + 1;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);

          await new Promise((resolve) => setTimeout(resolve, delay));
          return instance.request(error.config!);
        } else {
          return Promise.reject(
            new Error(
              'Сервер временно недоступен. Попробуйте обновить страницу через несколько минут.',
            ),
          );
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

/**
 * Инстанс без авторизации (для логина и регистрации).
 */
export const publicInstance = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_BASE_URL),
  headers: { 'Content-Type': 'application/json' },
});

export const baseInstanceV1 = createPrivateInstance();
