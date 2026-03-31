import { Drawer, Button } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from 'app/StoreProvider';
import classes from './InviteFriendDrawer.module.scss';

interface InviteFriendDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export const InviteFriendDrawer = observer(
  ({ opened, onClose }: InviteFriendDrawerProps) => {
    const { referralStore } = useStore();

    useEffect(() => {
      if (
        opened &&
        !referralStore.inviteLink &&
        !referralStore.isLimitReached
      ) {
        referralStore.generateInviteLinkAction();
      }
    }, [opened, referralStore]);

    const handleShare = () => {
      if (!referralStore.inviteLink) return;

      const text = 'Присоединяйся к Tarelka!';
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(
        referralStore.inviteLink,
      )}&text=${encodeURIComponent(text)}`;

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openTelegramLink(fullUrl);
      } else {
        window.open(fullUrl, '_blank');
      }
      onClose();
    };

    const isDisabled =
      referralStore.isLimitReached ||
      referralStore.isLoading ||
      !!referralStore.error;

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

        {referralStore.isLimitReached && (
          <p className={classes.linksCount}>Лимит приглашений исчерпан</p>
        )}

        {referralStore.error && (
          <p className={classes.linksCount}>{referralStore.error}</p>
        )}

        <Button
          fullWidth
          size="lg"
          radius="xl"
          className={classes.button}
          onClick={handleShare}
          disabled={isDisabled}
          loading={referralStore.isLoading}
        >
          Поделиться ссылкой
        </Button>
      </Drawer>
    );
  },
);
