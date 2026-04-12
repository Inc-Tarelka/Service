import type { PublicationTeamMember } from 'shared/api/service/Publication/types';
import { useState } from 'react';
import type { ServiceAuthor } from 'shared/api/service/PublicationServicesSearch';
import defaultUserSvg from 'shared/assets/images/defaultUser.svg';
import s from './TeamMemberItem.module.scss';

interface TeamMemberItemProps {
  member: ServiceAuthor | PublicationTeamMember;
  isAuthor?: boolean;
  onClick?: (id: number) => void;
}

const isPublicationTeamMember = (
  member: ServiceAuthor | PublicationTeamMember,
): member is PublicationTeamMember => {
  return 'userId' in member;
};

export const TeamMemberItem = ({
  member,
  isAuthor,
  onClick,
}: TeamMemberItemProps) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = isPublicationTeamMember(member)
    ? member.avatarUrl
    : member.logo_url;
  const isInteractive = Boolean(onClick);
  const memberId = isPublicationTeamMember(member) ? member.userId : member.id;
  const memberName = isPublicationTeamMember(member)
    ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
    : member.username;
  const memberRole = isPublicationTeamMember(member)
    ? [member.specialization, member.cityName].filter(Boolean).join(', ')
    : member.education || 'Москва';

  return (
    <div
      className={s.teamMember}
      onClick={() => onClick?.(memberId)}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      style={{ cursor: isInteractive ? 'pointer' : 'default' }}
    >
      <div className={s.avatarWrapper}>
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            className={s.avatar}
            alt={memberName || 'User avatar'}
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src={defaultUserSvg}
            className={s.avatar}
            alt={memberName || 'Default user avatar'}
          />
        )}
      </div>
      <div className={s.memberInfo}>
        <span className={s.memberName}>{memberName}</span>
        <span className={s.memberRole}>{memberRole}</span>
        {isAuthor && <span className={s.authorLabel}>Автор публикации</span>}
      </div>
    </div>
  );
};
