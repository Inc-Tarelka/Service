import s from './WelcomeScreen.module.scss';
import { motion } from 'framer-motion';

export const WelcomeScreen = () => {

  return (
    <motion.div
      className={s.screen}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      efrwoiph
    </motion.div>
  );
};
