import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function Arrow(): ReactNode {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const cards = [
  {
    title: "Getting started",
    to: "/docs/getting-started/create-an-app",
    body: "Create an app in the Dev Console and make your first API call.",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    title: "Embedded apps",
    to: "/docs/embedded-apps",
    body: "Run your app inside the Jubelio App Store and verify the session token.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </>
    ),
  },
  {
    title: "Authentication",
    to: "/docs/authentication",
    body: "Exchange the install code for tokens and keep them refreshed.",
    icon: (
      <>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  {
    title: "API Reference",
    to: "/docs/api",
    body: "Every Open API endpoint with its scope, parameters and response.",
    icon: <path d="M8 7 3 12l5 5M16 7l5 5-5 5" />,
  },
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <Heading as="h1" className={styles.title}>
              {siteConfig.title}
            </Heading>
            <p className={styles.lead}>
              Guides and API reference for building apps that merchants open
              inside the Jubelio App Store.
            </p>
            <Link className={styles.button} to="/docs/">
              Read the documentation
            </Link>
          </div>
        </header>
        <main className={styles.cards}>
          {cards.map((c) => (
            <Link key={c.title} to={c.to} className={styles.card}>
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden>
                {c.icon}
              </svg>
              <div>
                <h3>
                  {c.title}
                  <Arrow />
                </h3>
                <p>{c.body}</p>
              </div>
            </Link>
          ))}
        </main>
      </div>
    </Layout>
  );
}
