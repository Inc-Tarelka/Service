import { useState } from 'react';
import type { ServiceAuthor } from 'shared/api/service/PublicationServicesSearch';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import s from './TeamMemberItem.module.scss';

interface TeamMemberItemProps {
  member: ServiceAuthor | any;
  isAuthor?: boolean;
  onClick?: (id: number) => void;
}

export const TeamMemberItem = ({
  member,
  isAuthor,
  onClick,
}: TeamMemberItemProps) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = member.logo_url || member.avatarUrl;

  return (
    <div
      className={s.teamMember}
      onClick={() => onClick?.(member.id || member.userId)}
      role="button"
      tabIndex={0}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={s.avatarWrapper}>
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            className={s.avatar}
            alt={member.username || member.firstName || 'User avatar'}
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={defaultUserSvg}
            className={s.avatar}
            alt={member.username || member.firstName || 'Default user avatar'}
          />
        )}
      </div>
      <div className={s.memberInfo}>
        <span className={s.memberName}>
          {member.firstName || member.lastName
            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
            : member.username}
        </span>
        <span className={s.memberRole}>
          {member.education ? `${member.education}, ` : ''}
          {member.location ?? member.city ?? 'Москва'}
        </span>
        {isAuthor && <span className={s.authorLabel}>Автор публикации</span>}
      </div>
    </div>
  );
};
