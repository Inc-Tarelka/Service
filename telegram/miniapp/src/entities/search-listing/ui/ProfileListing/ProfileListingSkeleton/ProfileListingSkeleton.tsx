import classes from './ProfileListingSkeleton.module.scss';

export const ProfileListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.avatar} />
        <div className={classes.info}>
          <div className={classes.name} />
          <div className={classes.details} />
        </div>
      </div>
      <div className={classes.projects}>
        <div className={classes.projectImage} />
        <div className={classes.projectImage} />
        <div className={classes.projectImage} />
      </div>
    </div>
  );
};
