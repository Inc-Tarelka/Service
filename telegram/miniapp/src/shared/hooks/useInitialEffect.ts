import { useLayoutEffect } from 'react';

export function useInitialEffect(callback: () => void) {
  useLayoutEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
