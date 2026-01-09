import { observer } from 'mobx-react-lite';
import LogoSvg from 'shared/assets/logo/logo.svg';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import s from './Navbar.module.scss';

interface NavbarProps {
  className?: string;
  hideLogo?: boolean;
}

export const Navbar = observer(({ className, hideLogo }: NavbarProps) => {
  const { isDesktop } = useViewport();

  return (
    <div
      className={classNames(s.navbar, { [s.desktop]: isDesktop }, [className])}
    >
      {!hideLogo && <img src={LogoSvg} alt="Logo" className={s.logo} />}
    </div>
  );
});
