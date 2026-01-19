import { Button } from '@mantine/core';
import s from './NotInTelegramPlaceholder.module.scss';
import LogoLarge from 'shared/assets/logo/logo-large.svg';

export const NotInTelegramPlaceholder = () => {
  return (
    <div className={s.container}>
      <div className={s.content}>
        <img src={LogoLarge} alt="logo" />
        <p className={s.description}>
          Наше приложение пока доступно только в Telegram Mini App
        </p>
        <Button radius="xl" variant="filled" size="lg">
          <a
            href="https://t.me/Tarelka_dev_weak_bot"
            target="_blank"
            rel="noopener noreferrer"
            className={s.link}
          >
            Открыть в Telegram
          </a>
        </Button>
      </div>
    </div>
  );
};
