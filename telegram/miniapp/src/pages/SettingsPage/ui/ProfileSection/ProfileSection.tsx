import { EditProfileForm } from 'features/edit-profile';
import { observer } from 'mobx-react-lite';

import s from './ProfileSection.module.scss';

export const ProfileSection = observer(() => {
  return (
    <div className={s.section}>
      <h2 className={s.title}>Аккаунт и профиль</h2>

      <EditProfileForm />
    </div>
  );
});
