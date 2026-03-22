import { Box, Stack } from '@mantine/core';
import { User } from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';
import s from './ProfileInfoSection.module.scss';

interface ProfileInfoSectionProps {
  user?: User;
  isPublicView?: boolean;
}

export const ProfileInfoSection = ({
  user = MOCK_USER,
}: ProfileInfoSectionProps) => {
  return (
    <Box className={s.container}>
      <Stack gap={24}>
        <Stack gap={8}>
          <h4 className={s.title}>Членство</h4>
          <div className={s.grid}>
            <span className={s.label}>Статус</span>
            <span className={s.value}>
              {user.status || 'Претендент в члены клуба'}
            </span>

            <span className={s.label}>Кто пригласил</span>
            <span className={s.valueBold}>Иванов Иван Иванович</span>
          </div>
        </Stack>

        <Stack gap={8}>
          <h4 className={s.title}>О себе</h4>
          <p className={s.about}>{user.about}</p>
        </Stack>

        <div className={s.grid} style={{ marginBottom: '18px' }}>
          <span className={s.label}>Город</span>
          <span className={s.value}>{user.city}</span>

          <span className={s.label}>Специализация</span>
          <span className={s.value}>{user.specialization}</span>

          <span className={s.label}>Статус</span>
          <span className={s.value}>{user.status}</span>

          <span className={s.label}>Образование</span>
          <span className={s.value}>{user.education}</span>

          <span className={s.label}>Мастер</span>
          <span className={s.valueBold}>Иванов Иван Иванович</span>
        </div>
      </Stack>
    </Box>
  );
};
