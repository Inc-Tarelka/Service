import { motion } from 'framer-motion';
import { memo } from 'react';
import BgImage from 'shared/assets/bg/bg';
import LogoLarge from 'shared/assets/logo/logo-large.svg';
import s from './WelcomeScreen.module.scss';

export const WelcomeScreen = memo(() => {
  return (
    <motion.div
      className={s.screen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <BgImage className={s.bg} />
      <motion.div
        className={s.logoContainer}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        <img
          src={LogoLarge}
          alt="Tarelka"
          className={s.logo}
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';
