import s from './LoaderPage.module.scss';
export const LoaderPage = () => {
  return (
    <div className={s.loaderPageBg}>
      <div className={s.loaderWrapper}>
        <div className={s.loaderContent}>
          <span className={s.loader}></span>
        </div>
      </div>
    </div>
  );
};
