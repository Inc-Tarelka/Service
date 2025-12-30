import s from './MainPage.module.scss';
import { Page } from 'widgets/Page/ui/Page';
import classNames from 'shared/library/ClassNames/classNames';
import { observer } from 'mobx-react-lite';
import { Button } from '@mantine/core'


export const MainPage = observer(() => {

  return (
    <Page className={classNames(s.mainPage, {}, [])}>
      <Button>erger5</Button>

    </Page>
  );
});

export default MainPage;
