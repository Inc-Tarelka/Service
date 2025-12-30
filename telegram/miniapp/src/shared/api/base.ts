import WebApp from '@twa-dev/sdk';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

let cachedToken: string | undefined = undefined;
let isServerDown = false;
let serverDownTimestamp = 0;

/**
 * Загружает токен из CloudStorage (один раз при старте).
 */
export const loadAccessTokenOnce = async (): Promise<void> => {
  try {
    if (
      WebApp.CloudStorage &&
      typeof WebApp.CloudStorage.getItems === 'function' &&
      (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
    ) {
      const items: any = await new Promise((resolve, reject) => {
        WebApp.CloudStorage.getItems(['access_token'], (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      const token = items?.['access_token'];
      if (token) {
        cachedToken = token;
      }
    }
  } catch (error) {
    console.error('Error loading token from CloudStorage:', error);
  }
};

export const setAccessToken = (token: string | undefined) => {
  cachedToken = token;

  if (
    token &&
    WebApp.CloudStorage &&
    (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
  ) {
    WebApp.CloudStorage.setItem('access_token', token, (error) => {
      if (error) {
        console.error('Error saving token to CloudStorage:', error);
      }
    });
  }
};

export const clearAccessToken = () => {
  cachedToken = undefined;

  if (
    WebApp.CloudStorage &&
    (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
  ) {
    WebApp.CloudStorage.removeItem('access_token', (error) => {
      if (error) {
        console.error('Error removing token from CloudStorage:', error);
      }
    });
  }
};

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
  // Убираем trailing slash если есть
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  // Проверяем, содержит ли URL уже /v1
  if (cleanUrl.endsWith('/v1') || cleanUrl.includes('/v1/')) {
    return cleanUrl;
  }
  // Добавляем /v1 если его нет
  return `${cleanUrl}/v1`;
}

/**
 * Инстанс с авторизацией (для всех запросов после логина).
 */
function createPrivateInstance(): AxiosInstance {
  const instance = axios.create({
    withCredentials: true,
    baseURL: normalizeBaseURL(import.meta.env.VITE_BASE_URL),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cachedToken}`,
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        console.log(
          'Request with token:',
          cachedToken.substring(0, 20) + '...',
        );
      } else {
        delete config.headers.Authorization;
        console.log('Request without token');
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => {
      console.log('Response success:', response.status, response.config.url);
      return response;
    },
    async (error: AxiosError) => {
      console.log(
        'Response error:',
        error.response?.status,
        error.config?.url,
        error.message,
      );

      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('Clearing token due to auth error');
        clearAccessToken();
        window.location.href = RoutePath.welcome;
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        console.log('403 Forbidden - server connection pool issue');

        isServerDown = true;
        serverDownTimestamp = Date.now();

        const retryCount = (error.config as any)?.['__retryCount'] || 0;
        const maxRetries = 3;

        if (retryCount < maxRetries) {
          console.log(`Retrying request... (${retryCount + 1}/${maxRetries})`);

          (error.config as any)['__retryCount'] = retryCount + 1;

          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`Waiting ${delay}ms before retry...`);

          await new Promise((resolve) => setTimeout(resolve, delay));

          return instance.request(error.config!);
        } else {
          console.log('Max retries reached for 403 error');
          const userFriendlyError = new Error(
            'Сервер временно недоступен. Попробуйте обновить страницу через несколько минут.',
          );
          return Promise.reject(userFriendlyError);
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
