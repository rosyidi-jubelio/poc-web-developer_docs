import React, {useMemo, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Markdown from '@theme/Markdown';

import styles from './styles.module.css';

// A loose view of an OpenAPI schema object, as the openapi plugin hands it over (refs resolved).
export type Schema = {
  type?: string | string[];
  format?: string;
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  allOf?: Schema[];
  oneOf?: Schema[];
  anyOf?: Schema[];
  enum?: unknown[];
  default?: unknown;
  nullable?: boolean;
  title?: string;
};

export type Row = {
  path: string;
  name: string;
  depth: number;
  schema: Schema;
  required: boolean;
  hasChildren: boolean;
  description?: string;
};

// Merges allOf parts into one schema so the table shows a single flat list of fields.
export function flatten(schema: Schema | undefined): Schema {
  if (!schema) return {};
  if (!schema.allOf) return schema;
  const merged: Schema = {...schema, allOf: undefined, properties: {}, required: []};
  for (const part of schema.allOf.map(flatten)) {
    merged.type ??= part.type;
    merged.description ??= part.description;
    Object.assign(merged.properties!, part.properties);
    merged.required!.push(...(part.required ?? []));
  }
  Object.assign(merged.properties!, schema.properties);
  merged.required!.push(...(schema.required ?? []));
  return merged;
}

// The object whose fields are listed under a row: the schema itself, or its array items.
function childObject(schema: Schema): Schema | undefined {
  const s = flatten(schema);
  if (s.properties && Object.keys(s.properties).length) return s;
  if (s.items) {
    const items = flatten(s.items);
    if (items.properties && Object.keys(items.properties).length) return items;
  }
  const variant = s.oneOf?.[0] ?? s.anyOf?.[0];
  return variant ? childObject(variant) : undefined;
}

export function typeLabel(schema: Schema): string {
  const s = flatten(schema);
  const types = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];
  const main = types.filter((t) => t !== 'null');
  let label: string;
  if (main[0] === 'array' || (!main.length && s.items)) {
    label = `[]${s.items ? typeLabel(s.items) : 'any'}`;
  } else if (main.length) {
    label = main.join(' | ');
  } else if (s.properties) {
    label = 'object';
  } else if (s.oneOf || s.anyOf) {
    label = (s.oneOf ?? s.anyOf)!.map(typeLabel).join(' | ');
  } else {
    label = types.includes('null') ? 'null' : 'any';
  }
  if (s.format && !label.startsWith('[]')) label += `(${s.format})`;
  if ((types.includes('null') && main.length) || s.nullable) label += ' | null';
  return label;
}

export function buildRows(schema: Schema, depth = 0, prefix = ''): Row[] {
  const obj = childObject(schema);
  if (!obj?.properties) return [];
  const required = new Set(obj.required ?? []);
  return Object.entries(obj.properties).flatMap(([name, child]) => {
    const path = prefix ? `${prefix}.${name}` : name;
    const children = buildRows(child, depth + 1, path);
    const row: Row = {
      path,
      name,
      depth,
      schema: child,
      required: required.has(name),
      hasChildren: children.length > 0,
      description: flatten(child).description,
    };
    return [row, ...children];
  });
}

function Notes({schema}: {schema: Schema}): ReactNode {
  const s = flatten(schema);
  const values = s.enum ?? s.items?.enum;
  return (
    <>
      {values && (
        <div className={styles.note}>
          Allowed:{' '}
          {values.map((v) => (
            <code key={String(v)}>{String(v)}</code>
          ))}
        </div>
      )}
      {s.default !== undefined && (
        <div className={styles.note}>
          Default: <code>{JSON.stringify(s.default)}</code>
        </div>
      )}
    </>
  );
}

export function FieldTable({
  rows,
  nameHeader = 'Properties',
  showRequired = true,
}: {
  rows: Row[];
  nameHeader?: string;
  showRequired?: boolean;
}): ReactNode {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const hidden = (path: string) =>
    [...collapsed].some((c) => path !== c && path.startsWith(`${c}.`));
  const toggle = (path: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  const expandable = rows.filter((r) => r.hasChildren).map((r) => r.path);
  const allCollapsed = expandable.length > 0 && expandable.every((p) => collapsed.has(p));

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.nameCol}>
              {expandable.length > 0 && (
                <button
                  type="button"
                  className={styles.toggle}
                  aria-label={allCollapsed ? 'Expand all' : 'Collapse all'}
                  onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(expandable))}>
                  {allCollapsed ? '+' : '−'}
                </button>
              )}
              {nameHeader}
            </th>
            <th className={styles.typeCol}>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter((r) => !hidden(r.path))
            .map((r) => (
              <tr key={r.path} className={clsx(r.depth > 0 ? styles.nested : styles.top)}>
                <td className={styles.nameCol}>
                  <div className={styles.name} style={{paddingLeft: `${r.depth * 1.75}rem`}}>
                    {r.hasChildren ? (
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={!collapsed.has(r.path)}
                        aria-label={`${collapsed.has(r.path) ? 'Expand' : 'Collapse'} ${r.name}`}
                        onClick={() => toggle(r.path)}>
                        {collapsed.has(r.path) ? '+' : '−'}
                      </button>
                    ) : (
                      <span className={styles.spacer} />
                    )}
                    <code className={styles.chip}>{r.name}</code>
                    {showRequired && r.required && <span className={styles.required}>Required</span>}
                  </div>
                </td>
                <td className={styles.typeCol}>
                  <code className={styles.chip}>{typeLabel(r.schema)}</code>
                </td>
                <td className={styles.desc}>
                  {r.description && <Markdown>{r.description}</Markdown>}
                  <Notes schema={r.schema} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SchemaTable({
  schema,
  showRequired = true,
}: {
  schema: Schema;
  showRequired?: boolean;
}): ReactNode {
  const rows = useMemo(() => buildRows(schema), [schema]);
  if (rows.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>
          <code className={styles.chip}>{typeLabel(schema)}</code>
          {flatten(schema).description && <Markdown>{flatten(schema).description!}</Markdown>}
        </div>
      </div>
    );
  }
  return <FieldTable rows={rows} showRequired={showRequired} />;
}
