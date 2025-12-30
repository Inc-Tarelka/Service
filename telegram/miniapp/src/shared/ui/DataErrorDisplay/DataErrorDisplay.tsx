import { Accordion, Button, Card, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import s from './DataErrorDisplay.module.scss';

interface DataErrorDisplayProps {
  error: Error | null;
  onRetry: () => void;
  message?: string;
}

export const DataErrorDisplay = observer((props: DataErrorDisplayProps) => {
  const {
    error,
    onRetry,
    message = 'Что-то пошло не так при загрузке данных.',
  } = props;

  if (!error) {
    return null;
  }

  return (
    <Card className={s.errorCard} withBorder={false}>
      <div className={s.errorContent}>
        <p className={s.errorMessage}>{message}</p>
      </div>
      <Accordion className={s.errorDetailsCollapse}>
        <Accordion.Item value="details" className={s.errorDetailsPanel}>
          <Accordion.Control>Подробнее об ошибке</Accordion.Control>
          <Accordion.Panel>
            <Text c="red">{error?.message || 'Неизвестная ошибка'}</Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Button
        variant="filled"
        size="sm"
        className={s.refreshButton}
        onClick={onRetry}
      >
        Обновить
      </Button>
    </Card>
  );
});
