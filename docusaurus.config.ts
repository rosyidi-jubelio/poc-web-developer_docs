import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';
import {existsSync, readFileSync} from 'node:fs';

// One API reference config per module or sub-module, written by `npm run sync:spec`.
type ModuleSpec = {id: string; specPath: string; outputDir: string};
const modulesFile = 'spec/modules.json';
const apiModules: ModuleSpec[] = existsSync(modulesFile)
  ? JSON.parse(readFileSync(modulesFile, 'utf8'))
  : [];

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Jubelio App Store Developers',
  tagline: 'Build apps on Jubelio merchant data',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // SITE_URL and BASE_URL are set by the GitHub Pages workflow; defaults are for the final domain.
  url: process.env.SITE_URL || 'https://developers.jubelio.com',
  baseUrl: (process.env.BASE_URL || '/').replace(/\/?$/, '/'),
  trailingSlash: false,

  customFields: {
    // Base URL the API testing tool sends requests to. Leave empty to call the spec's server
    // directly; set it to a proxy when the API does not allow calls from browsers.
    apiTestingBaseUrl: process.env.API_TESTING_BASE_URL ?? '',
  },

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: Object.fromEntries(
          apiModules.map((m) => [
            m.id,
            {
              specPath: m.specPath,
              outputDir: m.outputDir,
              showInfoPage: false,
            } satisfies OpenApiPlugin.Options,
          ]),
        ),
      },
    ],
  ],

  themes: ['docusaurus-theme-openapi-docs', '@docusaurus/theme-mermaid'],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Jubelio App Store',
      logo: {
        alt: 'Jubelio',
        src: 'img/logo.svg',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'guides', position: 'left', label: 'Guides'},
        {type: 'docSidebar', sidebarId: 'api', position: 'left', label: 'API reference'},
        {to: '/api-testing', label: 'API testing', position: 'left'},
        {to: '/docs/changelog', label: 'Changelog', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting started', to: '/docs/getting-started/create-an-app'},
            {label: 'Authentication', to: '/docs/authentication'},
            {label: 'API reference', to: '/docs/api'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'API testing tool', to: '/api-testing'},
            {label: 'Changelog', to: '/docs/changelog'},
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Jubelio.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
