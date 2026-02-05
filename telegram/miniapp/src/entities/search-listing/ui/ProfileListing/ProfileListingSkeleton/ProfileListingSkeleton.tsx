import classes from './ProfileListingSkeleton.module.scss';

export const ProfileListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.image} />
      <div className={classes.content}>
        <div className={classes.name} />
        <div className={classes.bio} />
        <div className={classes.bioShort} />
        <div className={classes.tags}>
          <div className={classes.tag} />
          <div className={classes.tag} />
          <div className={classes.tag} />
        </div>
      </div>
    </div>
  );
};
