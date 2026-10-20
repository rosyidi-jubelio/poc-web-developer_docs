// Searchable endpoint dropdown for the API testing tool, grouped by module and sub-module.
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

type Group = {module: string; subs: {sub: string | null; items: PickerItem[]}[]};

function groupItems(items: PickerItem[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    let g = groups.find((x) => x.module === item.module);
    if (!g) groups.push((g = {module: item.module, subs: []}));
    let s = g.subs.find((x) => x.sub === item.sub);
    if (!s) g.subs.push((s = {sub: item.sub, items: []}));
    s.items.push(item);
  }
  return groups;
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
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const selected = items.find((i) => i.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.method, i.path, i.summary, i.module, i.sub ?? ''].join(' ').toLowerCase().includes(q),
    );
  }, [items, query]);
  const groups = useMemo(() => groupItems(filtered), [filtered]);

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, filtered.findIndex((i) => i.id === value)));
    search.current?.focus();
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
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
    root.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({block: 'nearest'});
  }, [active]);

  return (
    <div className={styles.root} ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        id="op"
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
        {selected ? (
          <>
            <span className={styles.crumb}>
              {selected.module}
              {selected.sub && ` / ${selected.sub}`}
            </span>
            <span className={styles.triggerMain}>
              <MethodBadge method={selected.method} />
              <span className={styles.summary}>{selected.summary}</span>
            </span>
          </>
        ) : (
          'Select an endpoint'
        )}
        <span className={styles.caret} aria-hidden>
          {'▾'}
        </span>
      </button>

      {open && (
        <div className={styles.panel}>
          <input
            ref={search}
            className={styles.search}
            placeholder="Search endpoints"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.list} role="listbox">
            {groups.length === 0 && <div className={styles.empty}>No endpoints match.</div>}
            {groups.map((g) => (
              <div key={g.module} className={styles.group}>
                <div className={styles.module}>{g.module}</div>
                {g.subs.map((s) => (
                  <div key={s.sub ?? '_'}>
                    {s.sub && <div className={styles.sub}>{s.sub}</div>}
                    {s.items.map((item) => {
                      const index = filtered.indexOf(item);
                      return (
                        <button
                          type="button"
                          role="option"
                          aria-selected={item.id === value}
                          key={item.id}
                          data-index={index}
                          className={clsx(
                            styles.option,
                            s.sub && styles.indented,
                            item.id === value && styles.selected,
                            index === active && styles.active,
                          )}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => pick(item.id)}>
                          <MethodBadge method={item.method} />
                          <span className={styles.optionText}>
                            <span className={styles.summary}>{item.summary}</span>
                            <code className={styles.path}>{item.path}</code>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
