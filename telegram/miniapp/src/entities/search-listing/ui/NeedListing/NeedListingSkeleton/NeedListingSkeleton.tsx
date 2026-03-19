import classes from './NeedListingSkeleton.module.scss';

export const NeedListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.title} />
      <div className={classes.description} />
      <div className={classes.descriptionShort} />
      <div className={classes.project} />
      <div className={classes.city} />
    </div>
  );
};
