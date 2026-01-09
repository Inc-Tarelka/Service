import { Box, Stack } from '@mantine/core';
import { User } from 'shared/api/service/User/types';
import { MOCK_USER } from 'shared/mocks/profileMocks';
import { Badge } from 'shared/ui/Badge';
import classes from './ProfileInfoSection.module.scss';

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
    <Box className={classes.container}>
      <Stack gap={24}>
        <Stack gap={8}>
          <h4 className={classes.title}>О себе</h4>
          <p className={classes.about}>{user.about}</p>
        </Stack>

        <Stack gap={12}>{user.tags?.map(renderTag)}</Stack>

        <div className={classes.grid}>
          <span className={classes.label}>Город</span>
          <span className={classes.value}>{user.city}</span>

          <span className={classes.label}>Статус</span>
          <span className={classes.value}>{user.status}</span>

          <span className={classes.label}>Образование</span>
          <span className={classes.value}>{user.education}</span>

          <span className={classes.label}>Специализация</span>
          <span className={classes.value}>{user.specialization}</span>
        </div>
      </Stack>
    </Box>
  );
};
