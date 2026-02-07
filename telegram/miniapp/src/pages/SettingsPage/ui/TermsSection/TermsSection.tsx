import { observer } from 'mobx-react-lite';

import ChevronRightIcon from 'shared/assets/icons/chevronRight'; // Check exist
import s from './TermsSection.module.scss';

export const TermsSection = observer(() => {
  const documents = [
    { id: 1, title: 'Пользовательское соглашение', link: '#' },
    { id: 2, title: 'Политика конфиденциальности', link: '#' },
    { id: 3, title: 'Правила сообщества', link: '#' },
    { id: 4, title: 'Правила сообщества', link: '#' },
    { id: 5, title: 'Правила сообщества', link: '#' },
    { id: 6, title: 'Правила сообщества', link: '#' },
    {
      id: 7,
      title:
        'Правила сообщества Правила сообществаПравила сообществаПравила сообщества',
      link: '#',
    },
    { id: 6, title: 'Правила сообщества', link: '#' },
  ];

  return (
    <div className={s.section}>
      <h2 className={s.title}>Условия использования</h2>

      <div className={s.list}>
        {documents.map((doc) => (
          <button key={doc.id} className={s.item}>
            {/* <DocumentIcon className={s.docIcon} /> */}
            <span className={s.label}>{doc.title}</span>
            <ChevronRightIcon className={s.chevron} />
          </button>
        ))}
      </div>
    </div>
  );
});
