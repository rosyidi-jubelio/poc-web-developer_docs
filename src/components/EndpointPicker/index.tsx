// Searchable endpoint dropdown for the API testing tool: categories on the left, endpoints on the right.
import React, {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

export type PickerItem = {
  id: string;
  method: string;
  path: string;
  summary: string;
  module: string;
  sub: string | null;
};

type Category = {key: string; module: string; sub: string | null; items: PickerItem[]};

const categoryKey = (item: PickerItem) => `${item.module}/${item.sub ?? ''}`;

function groupItems(items: PickerItem[]): Category[] {
  const categories: Category[] = [];
  for (const item of items) {
    const key = categoryKey(item);
    let c = categories.find((x) => x.key === key);
    if (!c) categories.push((c = {key, module: item.module, sub: item.sub, items: []}));
    c.items.push(item);
  }
  return categories;
}

export function MethodBadge({method}: {method: string}): ReactNode {
  return <span className={clsx(styles.method, styles[method.toLowerCase()])}>{method}</span>;
}

export default function EndpointPicker({
  items,
  value,
  onChange,
}: {
  items: PickerItem[];
  value: string;
  onChange: (id: string) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  const selected = items.find((i) => i.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.method, i.path, i.summary, i.module, i.sub ?? ''].join(' ').toLowerCase().includes(q),
    );
  }, [items, query]);
  const categories = useMemo(() => groupItems(filtered), [filtered]);
  const modules = useMemo(() => {
    const out: {module: string; categories: Category[]}[] = [];
    for (const c of categories) {
      let m = out.find((x) => x.module === c.module);
      if (!m) out.push((m = {module: c.module, categories: []}));
      m.categories.push(c);
    }
    return out;
  }, [categories]);

  const scrollToCategory = (key: string) => {
    const section = list.current?.querySelector<HTMLElement>(`[data-category="${CSS.escape(key)}"]`);
    if (section && list.current) list.current.scrollTop = section.offsetTop;
    setCategory(key);
  };

  useEffect(() => {
    if (!open) return;
    const index = Math.max(0, filtered.findIndex((i) => i.id === value));
    setActive(index);
    search.current?.focus();
    const current = filtered[index];
    if (current) {
      const option = list.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
      const section = option?.closest<HTMLElement>('[data-category]');
      if (section && list.current) list.current.scrollTop = section.offsetTop;
      setCategory(categoryKey(current));
    }
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    if (list.current) list.current.scrollTop = 0;
    setCategory(categories[0]?.key ?? null);
  }, [query]);

  const onListScroll = () => {
    const el = list.current;
    if (!el) return;
    let current: string | null = null;
    for (const section of el.querySelectorAll<HTMLElement>('[data-category]')) {
      if (section.offsetTop <= el.scrollTop + 8) current = section.dataset.category ?? null;
    }
    setCategory(current ?? categories[0]?.key ?? null);
  };

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    }
    if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault();
      pick(filtered[active].id);
    }
  };

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({block: 'nearest'});
  }, [active]);

  useEffect(() => {
    const item = nav.current?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!item || !nav.current) return;
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < nav.current.scrollTop || bottom > nav.current.scrollTop + nav.current.clientHeight) {
      nav.current.scrollTop = top - nav.current.clientHeight / 3;
    }
  }, [category, open]);

  return (
    <div className={styles.root} ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        id="op"
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
        <span className={styles.triggerLabel}>API name</span>
        {selected ? (
          <span className={styles.triggerText}>
            <span className={styles.summary}>{selected.summary}</span>
            <code className={styles.path}>{selected.path}</code>
          </span>
        ) : (
          <span className={styles.triggerText}>Select an endpoint</span>
        )}
        {selected && <MethodBadge method={selected.method} />}
        <span className={clsx(styles.caret, open && styles.caretOpen)} aria-hidden />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.searchWrap}>
            <input
              ref={search}
              className={styles.search}
              placeholder="Search by name, path, or module"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <div className={styles.columns}>
            <nav className={styles.nav} ref={nav}>
              {modules.map((m) => (
                <div key={m.module} className={styles.navGroup}>
                  {m.categories.length === 1 && m.categories[0].sub === null ? (
                    <NavItem
                      label={m.module}
                      active={category === m.categories[0].key}
                      onClick={() => scrollToCategory(m.categories[0].key)}
                    />
                  ) : (
                    <>
                      <div className={styles.navModule}>{m.module}</div>
                      <div className={styles.navSub}>
                        {m.categories.map((c) => (
                          <NavItem
                            key={c.key}
                            label={c.sub ?? c.module}
                            active={category === c.key}
                            onClick={() => scrollToCategory(c.key)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </nav>
            <div className={styles.list} role="listbox" ref={list} onScroll={onListScroll}>
              {categories.length === 0 && <div className={styles.empty}>No endpoints match.</div>}
              {categories.map((c) => (
                <div key={c.key} data-category={c.key}>
                  <div className={styles.groupTitle}>{c.sub ? `${c.module} / ${c.sub}` : c.module}</div>
                  {c.items.map((item) => {
                    const index = filtered.indexOf(item);
                    const isSelected = item.id === value;
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        key={item.id}
                        data-index={index}
                        className={clsx(
                          styles.option,
                          isSelected && styles.selected,
                          index === active && styles.active,
                        )}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => pick(item.id)}>
                        <span className={clsx(styles.radio, isSelected && styles.radioOn)} aria-hidden />
                        <span className={styles.optionText}>
                          <span className={styles.summary}>{item.summary}</span>
                          <code className={styles.path}>{item.path}</code>
                        </span>
                        <MethodBadge method={item.method} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({label, active, onClick}: {label: string; active: boolean; onClick: () => void}): ReactNode {
  return (
    <button
      type="button"
      aria-current={active}
      className={clsx(styles.navItem, active && styles.navActive)}
      onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}
