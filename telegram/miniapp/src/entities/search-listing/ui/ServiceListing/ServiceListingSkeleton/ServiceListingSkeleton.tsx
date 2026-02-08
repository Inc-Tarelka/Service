import classes from './ServiceListingSkeleton.module.scss';

export const ServiceListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.badges}>
        <div className={classes.badge} />
        <div className={classes.badge} />
      </div>

      <div className={classes.content}>
        <div className={classes.userInfo}>
          <div className={classes.author} />
          <div className={classes.city} />
        </div>
        <div className={classes.title} />
        <div className={classes.description} />
        <div className={classes.descriptionShort} />
      </div>
    </div>
  );
};
