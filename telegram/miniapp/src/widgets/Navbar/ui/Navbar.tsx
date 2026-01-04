import LogoSvg from 'shared/assets/logo/logo.svg';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import s from './Navbar.module.scss';

interface NavbarProps {
  spacerOnly?: boolean;
}

export const Navbar = ({ spacerOnly = false }: NavbarProps) => {
  const { isDesktop } = useViewport();

  if (spacerOnly) {
    return <div className={classNames(s.spacer, { [s.desktop]: isDesktop })} />;
  }

  return (
    <div className={classNames(s.navbar, { [s.desktop]: isDesktop })}>
      <img src={LogoSvg} alt="Logo" className={s.logo} />
    </div>
  );
};
