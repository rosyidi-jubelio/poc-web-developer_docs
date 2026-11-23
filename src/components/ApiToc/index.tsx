// Table of contents for API pages. The sections are rendered by theme components, not
// markdown headings, so the list is read from the page: the Request and Response headings,
// then every element marked with data-toc under them.
import React, {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';

type Entry = {id: string; label: string; level: 1 | 2};

const SELECTOR = '.theme-api-markdown #request, .theme-api-markdown #response, .theme-api-markdown [data-toc]';

function readEntries(): Entry[] {
  return [...document.querySelectorAll<HTMLElement>(SELECTOR)]
    .filter((el) => el.id)
    .map((el) => ({
      id: el.id,
      label: el.dataset.toc ?? (el.textContent ?? '').replace(/​/g, '').trim(),
      level: el.dataset.toc ? 2 : 1,
    }));
}

export default function ApiToc(): ReactNode {
  const {pathname} = useLocation();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const next = readEntries();
      setEntries((prev) =>
        prev.length === next.length && prev.every((e, i) => e.id === next[i].id && e.label === next[i].label)
          ? prev
          : next,
      );
    };
    update();
    const root = document.querySelector('.theme-api-markdown');
    const observer = new MutationObserver(update);
    if (root) observer.observe(root, {childList: true, subtree: true});
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const offset = document.querySelector<HTMLElement>('.navbar')?.offsetHeight ?? 64;
      let current: string | null = entries[0]?.id ?? null;
      for (const e of entries) {
        const el = document.getElementById(e.id);
        if (el && el.getBoundingClientRect().top <= offset + 32) current = e.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const last = entries[entries.length - 1];
      if (atBottom && last) {
        const el = document.getElementById(last.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight) current = last.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [entries]);

  if (entries.length === 0) return null;
  return (
    <nav className="jbl-api-toc" aria-label="On this page">
      <ul className="table-of-contents table-of-contents__left-border">
        {entries.map((e) => (
          <li key={e.id} className={clsx(e.level === 2 && 'jbl-api-toc__sub')}>
            <a
              href={`#${e.id}`}
              className={clsx('table-of-contents__link', active === e.id && 'table-of-contents__link--active')}>
              {e.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
