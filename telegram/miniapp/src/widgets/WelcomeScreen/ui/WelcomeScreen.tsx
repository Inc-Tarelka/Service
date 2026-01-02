import { motion } from 'framer-motion';
import LogoLarge from 'shared/assets/logo/logo-large.svg';
import s from './WelcomeScreen.module.scss';

export const WelcomeScreen = () => {
  return (
    <motion.div
      className={s.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={s.logoContainer}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <img src={LogoLarge} alt="Tarelka" className={s.logo} />
      </motion.div>
    </motion.div>
  );
};
