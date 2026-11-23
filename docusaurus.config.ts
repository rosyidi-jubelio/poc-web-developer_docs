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
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    mermaid: {
      theme: {light: 'base', dark: 'base'},
      options: {
        fontFamily: 'inherit',
        themeVariables: {
          fontFamily: 'inherit',
          fontSize: '14px',
          primaryColor: '#eef1fe',
          primaryBorderColor: '#c5cdf9',
          primaryTextColor: '#163a50',
          secondaryColor: '#f7f8fa',
          tertiaryColor: '#ffffff',
          lineColor: '#8a96a3',
          textColor: '#163a50',
          actorBkg: '#eef1fe',
          actorBorder: '#c5cdf9',
          actorTextColor: '#163a50',
          actorLineColor: '#c5cdf9',
          signalColor: '#4d6474',
          signalTextColor: '#163a50',
          labelBoxBkgColor: '#eef1fe',
          labelBoxBorderColor: '#c5cdf9',
          labelTextColor: '#163a50',
          noteBkgColor: '#fef9e7',
          noteBorderColor: '#f3e2a5',
          noteTextColor: '#163a50',
          activationBkgColor: '#eef1fe',
          activationBorderColor: '#c5cdf9',
        },
      },
    },
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
        {type: 'docSidebar', sidebarId: 'api', position: 'left', label: 'API Reference'},
        {to: '/api-testing', label: 'API Testing', position: 'left'},
        {to: '/docs/changelog', label: 'Changelog', position: 'left'},
      ],
    },
    footer: {
      links: [
        {
          title: 'Get started',
          items: [
            {label: 'Introduction', to: '/docs'},
            {label: 'Create an app', to: '/docs/getting-started/create-an-app'},
            {label: 'First API call', to: '/docs/getting-started/first-api-call'},
          ],
        },
        {
          title: 'Build',
          items: [
            {label: 'Authentication', to: '/docs/authentication'},
            {label: 'Webhooks', to: '/docs/webhooks'},
            {label: 'Embedded apps', to: '/docs/embedded-apps'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'API Reference', to: '/docs/api'},
            {label: 'API Testing Tool', to: '/api-testing'},
            {label: 'Changelog', to: '/docs/changelog'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Jubelio. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
