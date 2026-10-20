import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const cards = [
  {
    title: 'Getting started',
    to: '/docs/getting-started/create-an-app',
    body: 'Create an app in the Dev Console and make your first API call.',
  },
  {
    title: 'Authentication',
    to: '/docs/authentication',
    body: 'How your app gets and refreshes tokens.',
  },
  {
    title: 'API reference',
    to: '/docs/api',
    body: 'Every Open API endpoint, generated from the OpenAPI specification.',
  },
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <header className={clsx('hero', styles.heroBanner)}>
        <div className="container">
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/">
              Read the docs
            </Link>
          </div>
        </div>
      </header>
      <main className={clsx('container', styles.cards)}>
        <div className="row">
          {cards.map((c) => (
            <div key={c.title} className="col col--4 margin-bottom--lg">
              <Link to={c.to} className={clsx('card padding--lg', styles.card)}>
                <Heading as="h3">{c.title}</Heading>
                <p>{c.body}</p>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
