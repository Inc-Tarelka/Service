import { useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): T {
  const isThrottled = useRef(false);

  return useCallback(
    (...args: any[]) => {
      if (isThrottled.current) {
        return;
      }

      callback(...args);
      isThrottled.current = true;

      setTimeout(() => {
        isThrottled.current = false;
      }, delay);
    },
    [callback, delay],
  ) as T;
}
