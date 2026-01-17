import s from './MainPage.module.scss';
import { Page } from 'widgets/Page/ui/Page';
import classNames from 'shared/library/ClassNames/classNames';
import { observer } from 'mobx-react-lite';
import WebApp from '@twa-dev/sdk';
export const MainPage = observer(() => {
  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      {WebApp.initDataUnsafe.user?.photo_url}
    </Page>
  );
});

export default MainPage;
