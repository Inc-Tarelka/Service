import { Button, Stack, Text } from '@mantine/core';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import ChatErrorIcon from 'shared/assets/icons/ChatError';
import classNames from 'shared/library/ClassNames/classNames';
import s from './ErrorPage.module.scss';

interface ErrorPageProps {
  className?: string;
}

export const ErrorPage = ({ className }: ErrorPageProps) => {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className={classNames(s.page, {}, [className])}>
      <div className={s.center}>
        <Stack align="center" gap={12}>
          <ChatErrorIcon size={36} color="var(--accent-color)" />
          <Text className={s.text}>
            {'Что-то пошло не так,\nмы уже ищем причину'}
          </Text>
        </Stack>
      </div>

      <div className={s.bottom}>
        <Button
          className={s.button}
          leftSection={<ArrowLeftIcon />}
          onClick={goBack}
          fullWidth
        >
          Назад
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
