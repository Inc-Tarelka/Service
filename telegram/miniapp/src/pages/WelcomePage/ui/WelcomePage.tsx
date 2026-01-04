import { Page } from 'widgets/Page/ui/Page';
import s from './WelcomePage.module.scss';
import { WelcomeScreen } from 'widgets/WelcomeScreen';

export const WelcomePage = () => {
  return (
    <Page className={s.page}>
      <WelcomeScreen />
    </Page>
  );
};

export default WelcomePage;
