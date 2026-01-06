import LogoSvg from 'shared/assets/logo/logo.svg';
import { useViewport } from 'shared/hooks/useViewport';
import classNames from 'shared/library/ClassNames/classNames';
import s from './Navbar.module.scss';

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  const { isDesktop } = useViewport();

  return (
    <div
      className={classNames(s.navbar, { [s.desktop]: isDesktop }, [className])}
    >
      <img src={LogoSvg} alt="Logo" className={s.logo} />
    </div>
  );
};
