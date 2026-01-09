import { Button } from '@mantine/core';

interface OfferCollaborationButtonProps {
  onClick: () => void;
}

export const OfferCollaborationButton = ({
  onClick,
}: OfferCollaborationButtonProps) => {
  return (
    <Button
      fullWidth
      radius="xl"
      size="lg"
      variant="filled"
      onClick={onClick}
      bg="var(--accent-color)"
      c="var(--bg-color)"
    >
      Предложить сотрудничество
    </Button>
  );
};
