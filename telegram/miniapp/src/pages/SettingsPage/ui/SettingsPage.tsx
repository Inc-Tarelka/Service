import { observer } from 'mobx-react-lite';
import { Activity, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SettingSection } from 'shared/consts/settingsMenuItems';
import { useBackButton } from 'shared/hooks/useBackButton';
import { Page } from 'widgets/Page';
import { NotificationsSection } from './NotificationsSection/NotificationsSection';
import { ProfileSection } from './ProfileSection/ProfileSection';
import { SecuritySection } from './SecuritySection/SecuritySection';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import s from './SettingsPage.module.scss';
import { TermsSection } from './TermsSection/TermsSection';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';

export const SettingsPage = observer(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSection = searchParams.get('section');
  const section: SettingSection | 'menu' =
    (rawSection as SettingSection) || 'menu';

  const goToSection = useCallback(
    (nextSection: SettingSection) => {
      if (nextSection) {
        setSearchParams({ section: nextSection });
      }
    },
    [setSearchParams],
  );

  const goToMenu = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const handleBack = useCallback(() => {
    if (section !== 'menu') {
      goToMenu();
    } else {
      navigate(RoutePath.profile);
    }
  }, [section, goToMenu, navigate]);

  useBackButton({
    show: true,
    onBack: handleBack,
  });

  return (
    <Page noPaddingBottom className={s.page}>
      <Activity mode={section === 'menu' ? 'visible' : 'hidden'}>
        <SettingsMenu onSelectSection={goToSection} />
      </Activity>

      <Activity mode={section === 'profile' ? 'visible' : 'hidden'}>
        <ProfileSection />
      </Activity>

      <Activity mode={section === 'security' ? 'visible' : 'hidden'}>
        <SecuritySection />
      </Activity>

      <Activity mode={section === 'notifications' ? 'visible' : 'hidden'}>
        <NotificationsSection />
      </Activity>

      <Activity mode={section === 'terms' ? 'visible' : 'hidden'}>
        <TermsSection />
      </Activity>
    </Page>
  );
});

export default SettingsPage;
