import { observer } from 'mobx-react-lite';

import ChevronRightIcon from 'shared/assets/icons/chevronRight';
import s from './TermsSection.module.scss';

interface TermsDocument {
  id: number;
  title: string;
  href: string;
}

const DOCUMENTS: TermsDocument[] = [
  {
    id: 1,
    title: 'Пользовательское соглашение',
    href: '/docs/user-agreement.html',
  },
  {
    id: 2,
    title: 'Политика конфиденциальности',
    href: '/docs/privacy-policy.html',
  },
];

export const TermsSection = observer(() => {
  return (
    <div className={s.section}>
      <h2 className={s.title}>Условия использования</h2>

      <div className={s.list}>
        {DOCUMENTS.map((doc) => (
          <a
            key={doc.id}
            className={s.item}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={s.label}>{doc.title}</span>
            <ChevronRightIcon className={s.chevron} />
          </a>
        ))}
      </div>
    </div>
  );
});
