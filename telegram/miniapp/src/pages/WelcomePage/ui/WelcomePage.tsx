import { Page } from 'widgets/Page/ui/Page';
import { WelcomeScreen } from 'widgets/WelcomeScreen';
import s from './WelcomePage.module.scss';

export const WelcomePage = () => {
  return (
    <Page className={s.page}>
      <WelcomeScreen />
    </Page>
  );
};

export default WelcomePage;
