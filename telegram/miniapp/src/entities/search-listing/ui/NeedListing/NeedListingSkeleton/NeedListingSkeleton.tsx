import classes from './NeedListingSkeleton.module.scss';

export const NeedListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.title} />
        <div className={classes.budget} />
      </div>
      <div className={classes.description} />
      <div className={classes.descriptionShort} />
      <div className={classes.footer}>
        <div className={classes.tags}>
          <div className={classes.tag} />
          <div className={classes.tag} />
        </div>
        <div className={classes.date} />
      </div>
    </div>
  );
};
