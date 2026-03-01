import type { ServiceAuthor } from 'shared/api/service/PublicationServicesSearch';
import s from './TeamMemberItem.module.scss';

interface TeamMemberItemProps {
  member: ServiceAuthor | any;
  isAuthor?: boolean;
}

export const TeamMemberItem = ({ member, isAuthor }: TeamMemberItemProps) => {
  return (
    <div className={s.teamMember}>
      <div className={s.avatarWrapper}>
        {member.logo_url ? (
          <img
            src={member.logo_url}
            className={s.avatar}
            alt={member.username}
          />
        ) : (
          <div className={s.avatarFallback}>
            {member.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={s.memberInfo}>
        <span className={s.memberName}>{member.username}</span>
        <span className={s.memberRole}>
          {member.education ? `${member.education}, ` : ''}
          {member.city ?? 'Москва'}
        </span>
        {isAuthor && <span className={s.authorLabel}>Автор публикации</span>}
      </div>
    </div>
  );
};
