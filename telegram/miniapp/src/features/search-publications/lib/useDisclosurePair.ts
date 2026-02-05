import { useDisclosure } from '@mantine/hooks';

export const useDisclosurePair = () => {
  const [startOpened, startHandlers] = useDisclosure(false);
  const [endOpened, endHandlers] = useDisclosure(false);

  return {
    start: { opened: startOpened, ...startHandlers },
    end: { opened: endOpened, ...endHandlers },
  };
};
