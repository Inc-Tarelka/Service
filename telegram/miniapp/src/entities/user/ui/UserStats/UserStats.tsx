import { useNavigate } from 'react-router-dom';
import { UserStats as UserStatsType } from 'shared/api/service/User/types';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import classes from './UserStats.module.scss';

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStats = ({ stats }: UserStatsProps) => {
  const navigate = useNavigate();

  const handleCollaboratorsClick = () => {
    navigate(`${RoutePath.collaborators}?tab=collaborators`);
  };

  const handleOutgoingClick = () => {
    navigate(`${RoutePath.collaborators}?tab=outgoing`);
  };

  return (
    <div className={classes.container}>
      <div className={classes.stat} onClick={handleCollaboratorsClick}>
        <span className={classes.count}>{stats.collaborations}</span>
        <span className={classes.label}>сокомандники</span>
      </div>

      <div className={classes.stat} onClick={handleOutgoingClick}>
        <span className={classes.count}>{stats.wantsToWork}</span>
        <span className={classes.label}>
          исходящие
          <br />
          запросы
        </span>
      </div>

      <div className={classes.stat}>
        <span className={classes.count}>{stats.projects}</span>
        <span className={classes.label}>проектов</span>
      </div>
    </div>
  );
};
