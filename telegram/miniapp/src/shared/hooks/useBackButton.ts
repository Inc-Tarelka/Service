import WebApp from '@twa-dev/sdk';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

interface UseBackButtonProps {
  /**
   * Показывать ли кнопку "назад"
   * @default true
   */
  show?: boolean;
  /**
   * Кастомный обработчик клика по кнопке "назад"
   * Если не передан, будет использоваться navigate(-1)
   */
  onBack?: () => void;
  /**
   * Путь для перехода, если история пуста
   * @default '/' (главная страница)
   */
  fallbackPath?: string;
  /**
   * Всегда переходить по fallbackPath, игнорируя историю
   * @default false
   */
  forceNavigate?: boolean;
}

/**
 * Хук для управления кнопкой "назад" в Telegram WebApp
 *
 * @example
 * // Стандартное использование (fallback на главную)
 * useBackButton();
 *
 * @example
 * // С кастомным путем
 * useBackButton('/training');
 *
 * @example
 * // Всегда идти на главную, игнорируя историю
 * useBackButton({
 *   fallbackPath: '/',
 *   forceNavigate: true
 * });
 *
 * @example
 * // С полными настройками
 * useBackButton({
 *   fallbackPath: '/training',
 *   onBack: () => console.log('Back clicked')
 * });
 */
export const useBackButton = (options?: UseBackButtonProps | string) => {
  const navigate = useNavigate();

  const normalizedOptions: UseBackButtonProps =
    typeof options === 'string' ? { fallbackPath: options } : options || {};

  const {
    show = true,
    onBack,
    fallbackPath = RoutePath.main,
    forceNavigate = false,
  } = normalizedOptions;

  useEffect(() => {
    if (!show) {
      WebApp.BackButton.hide();
      return;
    }

    const handleBackButton = () => {
      if (onBack) {
        onBack();
      } else if (forceNavigate) {
        navigate(fallbackPath);
      } else {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(fallbackPath);
        }
      }
    };

    WebApp.BackButton.show();
    WebApp.BackButton.onClick(handleBackButton);

    return () => {
      WebApp.BackButton.hide();
      WebApp.BackButton.offClick(handleBackButton);
    };
  }, [show, onBack, navigate, fallbackPath, forceNavigate]);
};
