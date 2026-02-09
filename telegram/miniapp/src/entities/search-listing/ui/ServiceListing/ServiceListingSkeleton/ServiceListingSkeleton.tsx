import classes from './ServiceListingSkeleton.module.scss';

export const ServiceListingSkeleton = () => {
  return (
    <div className={classes.container}>
      <div className={classes.imageSection} />

      <div className={classes.infoSection}>
        <div className={classes.authorRow}>
          <div className={classes.authorData}>
            <div className={classes.authorName} />
            <div className={classes.authorUsername} />
          </div>
          <div className={classes.city} />
        </div>

        <div className={classes.title} />
        <div className={classes.description} />
        <div className={classes.descriptionShort} />
      </div>
    </div>
  );
};
