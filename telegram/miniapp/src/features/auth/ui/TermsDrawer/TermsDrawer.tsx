import { ActionIcon, Drawer } from '@mantine/core';
import { useEffect, useState } from 'react';

import XIcon from 'shared/assets/icons/x';

import s from './TermsDrawer.module.scss';

interface TermsDrawerProps {
  opened: boolean;
  onClose: () => void;
}

const DOCS = [
  {
    id: 'agreement',
    label: 'Пользовательское соглашение',
    url: '/docs/user-agreement.html',
  },
  {
    id: 'privacy',
    label: 'Политика обработки данных',
    url: '/docs/privacy-policy.html',
  },
] as const;

type DocId = (typeof DOCS)[number]['id'];

export const TermsDrawer = (props: TermsDrawerProps) => {
  const { opened, onClose } = props;
  const [activeTab, setActiveTab] = useState<DocId>('agreement');
  const [htmlContent, setHtmlContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!opened) return;

    const doc = DOCS.find((d) => d.id === activeTab);
    if (!doc || htmlContent[activeTab]) return;

    fetch(doc.url)
      .then((res) => res.text())
      .then((html) => {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const content = bodyMatch ? bodyMatch[1] : html;
        setHtmlContent((prev) => ({ ...prev, [activeTab]: content }));
      });
  }, [opened, activeTab, htmlContent]);

  return (
    <Drawer
      className={s.drawer}
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="85%"
      withCloseButton={false}
      radius="md"
    >
      <div className={s.header}>
        <h2 className={s.headerTitle}>Правила использования</h2>
        <ActionIcon variant="subtle" onClick={onClose}>
          <XIcon />
        </ActionIcon>
      </div>

      <div className={s.tabs}>
        {DOCS.map((doc) => (
          <button
            key={doc.id}
            className={`${s.tab} ${activeTab === doc.id ? s.active : ''}`}
            onClick={() => setActiveTab(doc.id)}
          >
            {doc.label}
          </button>
        ))}
      </div>

      <div
        className={s.content}
        dangerouslySetInnerHTML={{
          __html: htmlContent[activeTab] || 'Загрузка...',
        }}
      />
    </Drawer>
  );
};
