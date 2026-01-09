import s from './MainPage.module.scss';
import { Page } from 'widgets/Page/ui/Page';
import classNames from 'shared/library/ClassNames/classNames';
import { observer } from 'mobx-react-lite';
export const MainPage = observer(() => {
  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      abc5допрнщшгеукошпеукекркеркерке
    </Page>
  );
});

export default MainPage;
