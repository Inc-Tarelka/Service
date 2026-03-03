import { Box, Stack } from '@mantine/core';
import { User } from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';
import { Badge } from 'shared/ui/Badge';
import s from './ProfileInfoSection.module.scss';

interface ProfileInfoSectionProps {
  user?: User;
  isPublicView?: boolean;
}

export const ProfileInfoSection = ({
  user = MOCK_USER,
}: ProfileInfoSectionProps) => {
  const renderTag = (tagStr: string, index: number) => {
    const parts = tagStr.split(' ');
    const lastPart = parts[parts.length - 1];

    const hasCount = /^[0-9+]+$/.test(lastPart);

    if (hasCount) {
      const label = parts.slice(0, -1).join(' ');
      return (
        <Badge key={index} count={lastPart}>
          {label}
        </Badge>
      );
    }

    return <Badge key={index}>{tagStr}</Badge>;
  };

  return (
    <Box className={s.container}>
      <Stack gap={24}>
        <Stack gap={8}>
          <h4 className={s.title}>О себе</h4>
          <p className={s.about}>{user.about}</p>
        </Stack>

        <Stack gap={12}>{user.tags?.map(renderTag)}</Stack>

        <div className={s.grid}>
          <span className={s.label}>Город</span>
          <span className={s.value}>{user.city}</span>

          <span className={s.label}>Статус</span>
          <span className={s.value}>{user.status}</span>

          <span className={s.label}>Образование</span>
          <span className={s.value}>{user.education}</span>

          <span className={s.label}>Специализация</span>
          <span className={s.value}>{user.specialization}</span>
        </div>
      </Stack>
    </Box>
  );
};
