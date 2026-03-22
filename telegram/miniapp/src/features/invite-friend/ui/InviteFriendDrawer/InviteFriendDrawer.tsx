import { Drawer, Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from 'app/StoreProvider';
import classes from './InviteFriendDrawer.module.scss';

interface InviteFriendDrawerProps {
  opened: boolean;
  onClose: () => void;
  linksCount?: number;
}

export const InviteFriendDrawer = observer(
  ({ opened, onClose, linksCount = 5 }: InviteFriendDrawerProps) => {
    const { referralStore, userStore } = useStore();

    const userId =
      window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
      userStore.profile?.id;

    useEffect(() => {
      if (opened && userId && !referralStore.inviteLink) {
        referralStore.generateInviteLinkAction(userId);
      }
    }, [opened, userId, referralStore]);

    const handleShare = () => {
      const shareUrl =
        referralStore.inviteLink ||
        `https://t.me/Tarelka_dev_weak_bot?startapp=senderID${userId}`;
      const text = 'Присоединяйся к Tarelka!';
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(text)}`;

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(fullUrl);
      } else {
        window.open(fullUrl, '_blank');
      }
      onClose();
    };

    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        radius={40}
        withCloseButton={false}
        size={275}
        classNames={{
          content: classes.drawerContent,
          body: classes.drawerBody,
        }}
      >
        <div className={classes.dragHandle} />

        <h2 className={classes.title}>Пригласить друга</h2>

        <p className={classes.description}>
          Вы можете отправить пригласительную ссылку другу, чтобы он смог
          зарегистрироваться в приложении.
        </p>

        <p className={classes.linksCount}>
          Осталось ссылок:{' '}
          <span className={classes.countNumber}>{linksCount}</span>
        </p>

        <Button
          fullWidth
          size="lg"
          radius="xl"
          className={classes.button}
          onClick={handleShare}
          disabled={linksCount === 0 || referralStore.isLoading}
          loading={referralStore.isLoading}
        >
          Поделиться ссылкой
        </Button>
      </Drawer>
    );
  },
);
