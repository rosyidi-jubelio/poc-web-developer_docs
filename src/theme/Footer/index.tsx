import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useThemeConfig} from '@docusaurus/theme-common';
import styles from './styles.module.css';

type FooterItem = {label: string; to: string};
type FooterColumn = {title: string; items: FooterItem[]};

export default function Footer(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {footer} = useThemeConfig();
  const logo = useBaseUrl('img/logo.svg');
  if (!footer) return null;
  const columns = (footer.links ?? []) as FooterColumn[];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className={styles.brandLink}>
              <img src={logo} alt="Jubelio" width={26} height={26} />
              <span>
                <strong>Jubelio App Store</strong>
                <small>Developers</small>
              </span>
            </Link>
            <p>{siteConfig.tagline}. Guides, API reference and tools for building apps that merchants install from the Jubelio App Store.</p>
          </div>
          <nav className={styles.columns} aria-label="Footer">
            {columns.map((column) => (
              <div key={column.title} className={styles.column}>
                <h3>{column.title}</h3>
                <ul>
                  {column.items.map((item) => (
                    <li key={item.label}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.bottom}>
          <span>{footer.copyright}</span>
          <Link href="https://jubelio.com">jubelio.com</Link>
        </div>
      </div>
    </footer>
  );
}
