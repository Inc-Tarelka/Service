import { Button, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from 'shared/assets/icons/arrowLeft';
import ChatErrorIcon from 'shared/assets/icons/ChatError';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import classNames from 'shared/library/ClassNames/classNames';
import s from './ErrorPage.module.scss';

interface ErrorPageProps {
  className?: string;
}

export const ErrorPage = ({ className }: ErrorPageProps) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(RoutePath.main, { replace: true });
  };

  return (
    <div className={classNames(s.page, {}, [className])}>
      <div className={s.center}>
        <div className={s.content}>
          <Stack align="center" gap={20}>
            <ChatErrorIcon size={62} color="var(--accent-color)" />
            <Text className={s.text}>
              {'Что-то пошло не так,\nмы уже ищем причину'}
            </Text>
          </Stack>
        </div>
      </div>

      <div className={s.bottom}>
        <Button
          className={s.button}
          leftSection={<ArrowLeftIcon className={s.arrowIcon} />}
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
