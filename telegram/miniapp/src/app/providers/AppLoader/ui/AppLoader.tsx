import { AnimatePresence } from 'framer-motion';
import { memo, useEffect, useState, type ReactNode } from 'react';

interface AppLoaderProps {
  children: ReactNode;
  splashScreen: ReactNode;
  minDisplayTime?: number;
}

/**
 * AppLoader - компонент для управления splash screen при первой загрузке приложения
 *
 * @param children - основное приложение (AppRouter)
 * @param splashScreen - компонент splash screen (WelcomeScreen)
 * @param minDisplayTime - минимальное время показа splash screen в мс (по умолчанию 400)
 */
export const AppLoader = memo((props: AppLoaderProps) => {
  const { children, splashScreen, minDisplayTime = 400 } = props;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const initializeApp = async () => {
      try {
        await Promise.resolve();

        if (!mounted) return;

        const elapsed = performance.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        timeoutId = setTimeout(() => {
          if (mounted) {
            try {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
              }
            } catch (error) {
              console.error(
                '[AppLoader] Telegram WebApp initialization error:',
                error,
              );
            }

            setTimeout(() => {
              if (mounted) {
                setShouldRender(true);
              }
            }, 400);
          }
        }, remainingTime);
      } catch (error) {
        console.error('[AppLoader] Initialization error:', error);
        if (mounted) {
          setShouldRender(true);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [minDisplayTime]);

  return (
    <>
      {children}
      <AnimatePresence>{!shouldRender && splashScreen}</AnimatePresence>
    </>
  );
});

AppLoader.displayName = 'AppLoader';
