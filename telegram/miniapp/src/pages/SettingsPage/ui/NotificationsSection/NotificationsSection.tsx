import { Switch } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import s from './NotificationsSection.module.scss';

export const NotificationsSection = observer(() => {
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: Call API to save settings
  };

  return (
    <div className={s.section}>
      <h2 className={s.title}>Уведомления</h2>

      <div className={s.card}>
        <div className={s.item}>
          <span className={s.label}>Push-уведомления</span>
          <Switch
            checked={settings.push}
            onChange={() => handleToggle('push')}
            color="green"
          />
        </div>

        <div className={s.item}>
          <span className={s.label}>Email-рассылка</span>
          <Switch
            checked={settings.email}
            onChange={() => handleToggle('email')}
            color="green"
          />
        </div>

        <div className={s.item}>
          <span className={s.label}>SMS-уведомления</span>
          <Switch
            checked={settings.sms}
            onChange={() => handleToggle('sms')}
            color="green"
          />
        </div>
      </div>
    </div>
  );
});
