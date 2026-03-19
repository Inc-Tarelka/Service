import { Switch } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import s from './NotificationsSection.module.scss';

export const NotificationsSection = observer(() => {
  const [settings, setSettings] = useState({
    cooperation: true,
    mentions: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: Call API to save settings
  };

  return (
    <div className={s.section}>
      <h2 className={s.title}>Уведомления</h2>

      <div className={s.list}>
        <div className={s.item}>
          <div className={s.info}>
            <span className={s.itemTitle}>Предложения о сотрудничестве</span>
            <p className={s.itemDescription}>
              Если у вас скрыты контакты и кто-то отправил запрос на
              сотрудничество, вы можете изучить его профиль и открыть контакты
              для связи.
            </p>
          </div>
          <Switch
            checked={settings.cooperation}
            onChange={() => handleToggle('cooperation')}
            color="green"
            size="md"
          />
        </div>

        <div className={s.item}>
          <div className={s.info}>
            <span className={s.itemTitle}>Отметки в публикациях</span>
            <p className={s.itemDescription}>
              Если кто-то отметит вас в своей публикации, вам придет запрос на
              подтверждение отметки.
            </p>
          </div>
          <Switch
            checked={settings.mentions}
            onChange={() => handleToggle('mentions')}
            color="green"
            size="md"
          />
        </div>
      </div>
    </div>
  );
});
