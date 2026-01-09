import { UserStats as UserStatsType } from 'shared/api/service/User/types';
import classes from './UserStats.module.scss';

interface UserStatsProps {
  stats: UserStatsType;
}

export const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <div className={classes.container}>
      <div className={classes.stat}>
        <span className={classes.count}>{stats.collaborations}</span>
        <span className={classes.label}>коллаборации</span>
      </div>

      <div className={classes.stat}>
        <span className={classes.count}>{stats.wantsToWork}</span>
        <span className={classes.label}>
          хотел бы
          <br />
          поработать
        </span>
      </div>

      <div className={classes.stat}>
        <span className={classes.count}>{stats.projects}</span>
        <span className={classes.label}>проектов</span>
      </div>
    </div>
  );
};
