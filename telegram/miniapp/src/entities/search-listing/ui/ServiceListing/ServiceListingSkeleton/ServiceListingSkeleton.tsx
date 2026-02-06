import classes from './ServiceListingSkeleton.module.scss';

export const ServiceListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.image} />
      <div className={classes.content}>
        <div className={classes.title} />
        <div className={classes.description} />
        <div className={classes.footer}>
          <div className={classes.tags}>
            <div className={classes.tag} />
            <div className={classes.tag} />
          </div>
          <div className={classes.likes} />
        </div>
      </div>
    </div>
  );
};
