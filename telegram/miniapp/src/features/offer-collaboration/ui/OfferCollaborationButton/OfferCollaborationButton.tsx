import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useState } from 'react';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';

interface OfferCollaborationButtonProps {
  userId: string;
}

export const OfferCollaborationButton = ({
  userId,
}: OfferCollaborationButtonProps) => {
  const [isOpen, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    console.log('Sending offer to', userId, comment);
    setOpen(false);
  };

  return (
    <>
      <Button fullWidth color="pink" radius="xl" onClick={() => setOpen(true)}>
        Предложить сотрудничество
      </Button>

      <Drawer opened={isOpen} onClose={() => setOpen(false)} size={385}>
        <Stack p={0} gap="xl">
          <Stack gap="xs">
            <Text size="sm" fw={500} c="white">
              Привязанный проект
            </Text>
            <Button
              variant="outline"
              color="gray"
              radius="md"
              leftSection={<PlusIcon />}
              styles={{
                root: {
                  borderColor: 'var(--primary-stroke)',
                  color: 'white',
                  backgroundColor: 'var(--card-bg)',
                  height: '48px',
                },
              }}
            >
              Добавить проект
            </Button>
          </Stack>

          <Textarea
            label="Комментарий"
            placeholder="Напишите сообщение..."
            value={comment}
            onChange={(event) => setComment(event.currentTarget.value)}
            minRows={4}
            styles={{
              label: {
                color: 'var(--text-color-secondary)',
                marginBottom: '8px',
              },
              input: {
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--primary-stroke)',
              },
            }}
            description={`${comment.length}/50`}
            inputWrapperOrder={['label', 'input', 'description']}
          />

          <Group gap="md">
            <ActionIcon
              variant="outline"
              color="gray"
              size="xl"
              radius="xl"
              onClick={() => setOpen(false)}
              styles={{
                root: {
                  borderColor: 'var(--primary-stroke)',
                  color: 'white',
                  width: '56px',
                  height: '56px',
                },
              }}
            >
              <XIcon />
            </ActionIcon>
            <Button
              style={{ flex: 1, height: '56px' }}
              color="pink"
              radius="xl"
              onClick={handleSubmit}
            >
              Отправить
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );
};
