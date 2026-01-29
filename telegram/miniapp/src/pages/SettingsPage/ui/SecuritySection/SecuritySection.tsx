import { ChangePasswordForm } from 'features/change-password';
import { observer } from 'mobx-react-lite';

import s from './SecuritySection.module.scss';
import { Page } from 'widgets/Page';

export const SecuritySection = observer(() => {
  return (
    <Page smallPaddingBottom className={s.section}>
      <h2 className={s.title}>Пароль и безопасность</h2>

      <ChangePasswordForm />
    </Page>
  );
});
