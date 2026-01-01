import LogoSvg from 'shared/assets/logo/logo.svg';
import s from './Navbar.module.scss';

interface NavbarProps {
  spacerOnly?: boolean;
}

export const Navbar = ({ spacerOnly = false }: NavbarProps) => {
  if (spacerOnly) {
    return <div className={s.spacer} />;
  }

  return (
    <div className={s.navbar}>
      <img src={LogoSvg} alt="Logo" className={s.logo} />
    </div>
  );
};
