import { Box, Stack } from '@mantine/core';
import { Sender, User } from 'shared/api/service/User/types';
import { UserRole } from 'shared/consts/userRoles';
import { MOCK_USER } from 'shared/mocks/profileMocks';
import s from './ProfileInfoSection.module.scss';

interface ProfileInfoSectionProps {
  user?: User;
  sender?: Sender;
  isPublicView?: boolean;
}

const getMembershipStatus = (role?: UserRole) => {
  return role === UserRole.ADMIN ? 'Член Клуба' : 'Претендент в члены клуба';
};

export const ProfileInfoSection = ({
  user = MOCK_USER,
  sender,
}: ProfileInfoSectionProps) => {
  return (
    <Box className={s.container}>
      <Stack gap={24}>
        <Stack gap={8}>
          <h4 className={s.title}>Членство</h4>
          <div className={s.grid}>
            <span className={s.label}>Статус</span>
            <span className={s.value}>{getMembershipStatus(user.role)}</span>

            <span className={s.label}>Кто пригласил</span>
            <span className={s.valueBold}>
              {sender ? `${sender.name} ${sender.surname}` : 'Не указано'}
            </span>
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
          <span className={s.valueBold}>
            {user.master?.name || 'Не указано'}
          </span>
        </div>
      </Stack>
    </Box>
  );
};
