import { useNavigate } from 'react-router-dom';
import { UserStats as UserStatsType } from 'shared/api/service/User/types';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import classes from './UserStats.module.scss';

interface UserStatsProps {
  stats: UserStatsType;
  onTeammatesClick?: () => void;
}

export const UserStats = ({ stats, onTeammatesClick }: UserStatsProps) => {
  const navigate = useNavigate();

  const handleCollaboratorsClick = () => {
    if (onTeammatesClick) {
      onTeammatesClick();
      return;
    }
    navigate(`${RoutePath.collaborators}?tab=collaborators`);
  };

  const handleOutgoingClick = () => {
    navigate(`${RoutePath.collaborators}?tab=outgoing`);
  };

  return (
    <div className={classes.container}>
      <div className={classes.stat} onClick={handleCollaboratorsClick}>
        <span className={classes.count}>{stats.teammatesCount}</span>
        <span className={classes.label}>сокомандники</span>
      </div>

      <div className={classes.stat} onClick={handleOutgoingClick}>
        <span className={classes.count}>{stats.outgoingRequestsCount}</span>
        <span className={classes.label}>
          исходящие
          <br />
          запросы
        </span>
      </div>

      <div className={classes.stat}>
        <span className={classes.count}>{stats.projectsCount}</span>
        <span className={classes.label}>проектов</span>
      </div>
    </div>
  );
};
