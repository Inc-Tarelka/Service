import { useStore } from 'app/StoreProvider';
import { ActionsDrawer } from 'entities/interaction/ui/ActionsDrawer/ActionsDrawer';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import {
  dangerMenuItems,
  MenuItem,
  menuItems,
  SettingSection,
} from 'shared/consts/settingsMenuItems';
import { InviteFriendDrawer } from 'features/invite-friend';
import s from './SettingsMenu.module.scss';

interface SettingsMenuProps {
  onSelectSection: (section: SettingSection) => void;
}

const SettingsMenuItem = observer(
  (props: { item: MenuItem; onClick: () => void }) => {
    const { item, onClick } = props;
    const Icon = item.icon;

    return (
      <button className={s.item} onClick={onClick}>
        <Icon className={item.isDanger ? s.dangerIcon : s.icon} />
        <span className={item.isDanger ? s.dangerLabel : s.label}>
          {item.label}
        </span>
        <ChevronRightIcon
          className={item.isDanger ? s.chevronDanger : s.chevron}
        />
      </button>
    );
  },
);

export const SettingsMenu = observer(
  ({ onSelectSection }: SettingsMenuProps) => {
    const { userStore, authStore } = useStore();
    const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
    const [isLogoutDrawerOpen, setIsLogoutDrawerOpen] = useState(false);
    const [isInviteFriendDrawerOpen, setIsInviteFriendDrawerOpen] =
      useState(false);

    const handleItemClick = (item: MenuItem) => {
      if (item.id === 'delete') {
        setIsDeleteDrawerOpen(true);
        return;
      }

      if (item.id === 'logout' || item.id === 'logout-all') {
        setIsLogoutDrawerOpen(true);
        return;
      }

      if (item.id === 'frends') {
        setIsInviteFriendDrawerOpen(true);
        return;
      }

      if (item.action) {
        item.action();
      } else if (item.section) {
        onSelectSection(item.section);
      }
    };

    const handleDeleteAccount = () => {
      userStore.deleteAccountAction();
    };

    const handleLogout = () => {
      authStore.logoutAction();
    };

    return (
      <div className={s.menu}>
        <h1 className={s.title}>Настройки</h1>

        <div className={s.cards}>
          <div className={s.card}>
            {menuItems.map((item) => (
              <SettingsMenuItem
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>

          <div className={s.card}>
            {dangerMenuItems.map((item) => (
              <SettingsMenuItem
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>

        <ActionsDrawer
          opened={isDeleteDrawerOpen}
          onClose={() => setIsDeleteDrawerOpen(false)}
          onDelete={handleDeleteAccount}
          fullWidth
          title="Вы уверены, что хотите удалить аккаунт?"
        />

        <ActionsDrawer
          opened={isLogoutDrawerOpen}
          onClose={() => setIsLogoutDrawerOpen(false)}
          onDelete={handleLogout}
          fullWidth
          title="Вы уверены, что хотите выйти?"
        />

        <InviteFriendDrawer
          opened={isInviteFriendDrawerOpen}
          onClose={() => setIsInviteFriendDrawerOpen(false)}
        />
      </div>
    );
  },
);
