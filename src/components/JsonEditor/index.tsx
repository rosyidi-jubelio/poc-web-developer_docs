import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {Highlight} from 'prism-react-renderer';
import {usePrismTheme} from '@docusaurus/theme-common';

import styles from './styles.module.css';

export default function JsonEditor({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}): ReactNode {
  const theme = usePrismTheme();
  return (
    <div
      className={clsx(styles.root, invalid && styles.invalid)}
      style={{background: theme.plain.backgroundColor, color: theme.plain.color}}>
      <div className={styles.stack}>
        <Highlight code={`${value}\n`} language="json" theme={theme}>
          {({tokens, getLineProps, getTokenProps}) => (
            <pre className={styles.layer} aria-hidden>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({line})}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({token})} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        <textarea
          className={clsx(styles.layer, styles.input)}
          style={{caretColor: theme.plain.color}}
          value={value}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Request body"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Tab') return;
            e.preventDefault();
            const el = e.currentTarget;
            const {selectionStart, selectionEnd} = el;
            onChange(`${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
            requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
          }}
        />
      </div>
    </div>
  );
}
