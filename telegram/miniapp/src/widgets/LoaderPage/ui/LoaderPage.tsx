import { useMemo } from 'react';
import s from './LoaderPage.module.scss';

const loadingMessages = [
  'Последние штрихи...',
  'Связываемся с экзаменаторами...',
  'Подбираем задания...',
  'Советуемся с лингвистами...',
  'Проверяем орфографию...',
  'Договариваемся о правилах...',
  'Настраиваем сложность...',
  'Полируем формулировки...',
  'Согласовываем детали...',
];

export const LoaderPage = () => {
  const message = useMemo(
    () => loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
    [],
  );

  return (
    <div className={s.loaderPageBg}>
      <div className={s.loaderWrapper}>
        <div className={s.loaderContent}>
          <span className={s.loader}></span>
          <p className={s.message}>{message}</p>
        </div>
      </div>
    </div>
  );
};
