# Jubelio App Store Developers (POC)

Public documentation for developers building apps on the Jubelio App Platform, built with
[Docusaurus](https://docusaurus.io/) 3.10 and
[docusaurus-plugin-openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs) 5.2.
Target domain: `developers.jubelio.com`.

## Requirements

- Node.js 20 or newer

## Run and build

```bash
npm install
npm start          # dev server on http://localhost:3000
npm run build      # static site in build/
npm run serve      # serve build/ locally
```

`npm start` and `npm run build` first run `prepare:api`, which prepares the committed spec and
regenerates the API reference. `npm run build` also runs `check:public`.

| Script | What it does |
| ------ | ------------ |
| `update:spec` | Copies the spec from its source into `openapi/openapi.yaml`. Run by hand, then commit. |
| `sync:spec` | Prepares `openapi/openapi.yaml` for the site, writing derived files to `spec/`. |
| `gen:api` | Regenerates the API reference in `docs/api/`, one folder per module and sub-module. |
| `prepare:api` | `sync:spec` then `gen:api`. |
| `check:public` | Fails if hand-written content contains internal details or the em-dash character. |
| `typecheck` | Runs `tsc`. |

## Deploy to GitHub Pages

`.github/workflows/jekyll-gh-pages.yml` builds the site and deploys it to GitHub Pages on every
push to `main` (or by hand from the Actions tab). Despite the file name, it does not use Jekyll.

One-time setup: **Settings > Pages > Build and deployment > Source: GitHub Actions**. No secrets
are needed, since the build uses the committed spec in `openapi/openapi.yaml`.

The workflow passes the Pages URL and path to the build (`SITE_URL`, `BASE_URL`), so the site
works under `https://<owner>.github.io/<repo>/`. To try the same build locally:

```bash
BASE_URL=/poc-web-developer_docs npm run build
BASE_URL=/poc-web-developer_docs npm run serve
```

When the site moves to its own domain, add the domain in the Pages settings; `BASE_URL` then
becomes `/` automatically.

## Spec

The site is built from **`openapi/openapi.yaml`**, a committed, public-safe copy of the Open API
spec. Its source of truth is `docs/open-api/api/openapi.yaml` in the `app-store-technical-docs`
repository. Builds (local and CI) only read the committed copy, so they need no access to that
repository.

When the source spec changes, refresh the copy and commit it:

```bash
npm run update:spec
git add openapi/openapi.yaml
git commit -m "docs: update OpenAPI spec"
```

`update:spec` reads the first source that is set:

| Variable | Use |
| -------- | --- |
| `OPENAPI_SPEC_URL` | An http(s) URL to the raw YAML. If `GITHUB_TOKEN` is set it is sent as a bearer token. |
| `OPENAPI_SPEC_PATH` | A local file path. |
| (default) | `../app-store-technical-docs/docs/open-api/api/openapi.yaml`, a sibling checkout. |

Before writing the copy, `scripts/sync-openapi.mjs`:

1. Replaces `servers` with the public base URL from `PUBLIC_API_BASE_URL`
   (default in `scripts/api-config.mjs`, currently the staging host
   `https://poc-open-api.qm-staging-k8s.jubelio.io/openapi/v1` until production is ready; also
   update the example in `docs/getting-started/first-api-call.md` when it changes). Other
   servers in the source spec, such as local, are not published.
2. Removes details external developers do not need: every regex `pattern` on fields, and the
   format description of `merchant_id` (it is shown as a plain string).
3. Removes modules marked `publish: false` in `scripts/api-modules.mjs`, and schemas only they
   used.
4. Scans the result with `scripts/public-safety.mjs` and stops if it finds internal details
   (internal identifiers, internal headers, service or host names, storage names) or the em-dash
   character. Fix those in the source spec, not here. The word "tenant" only produces a warning,
   since the public term is "merchant".

`sync:spec` (run by `start` and `build`) applies the same steps to the committed copy, then
writes the derived files to `spec/` (gitignored) and the API reference goes to `docs/api/`
(gitignored).

## API modules

The API reference mirrors the Open API modules. `scripts/api-modules.mjs` maps each spec tag to
a module folder. Modules that are not `flat` are split into sub-modules by the first path segment,
so `/products` and `/products/archive` both land in `catalogue/products`:

```
docs/api/
  auth/                    Authentication
  merchant/                Merchant
  catalogue/products/      Catalogue > Products
  catalogue/categories/    Catalogue > Categories
  wms/locations/           WMS > Locations
  wms/transfer-orders/     WMS > Transfer orders
  finance/invoices/        Finance > Invoices
  finance/accounts/        Finance > Accounts
  reference/               Reference
```

`sync:spec` writes one spec per folder to `spec/modules/` and a manifest `spec/modules.json`.
`docusaurus.config.ts` creates one API reference config per manifest entry, and
`scripts/api-categories.mjs` writes the sidebar labels and order. A tag that is missing from the
map fails the sync, so new modules are not published by accident. Set `publish: false` to keep a
module out (Orders is unpublished for now).

## Layout

```
docs/
  intro.md                 Overview (served at /docs/)
  getting-started/         Create an app, first API call
  authentication.md        Install flow, tokens, required headers
  embedded-apps.md         Session token (stub)
  webhooks.md              Stub
  api-overview.md          API reference landing page (/docs/api)
src/pages/api-testing.tsx  API testing tool (/api-testing)
  changelog.md
  api/                     Generated, gitignored
openapi/
  openapi.yaml             Committed public copy of the spec (npm run update:spec)
scripts/
  sync-openapi.mjs         Spec update, preparation and module split
  api-modules.mjs          Tag to module folder map
  api-categories.mjs       Sidebar labels for module folders
  check-public.mjs         Public-safety check for hand-written content
  public-safety.mjs        Shared list of blocked terms
spec/                      Synced spec, gitignored
```

## Theme

The look follows the Jubelio Dev Console (`web-developer_console`): Nunito Sans, primary
`#4b68ef`, navy text `#163a50`, the light blue app surface, a white header with a soft shadow and
a filled primary active sidebar item. Light mode only, like the Dev Console. The tokens live at the
top of `src/css/custom.css`; when the Dev Console tokens in `src/app/styles/globals.css` change,
update them there. The logo and favicon are copied from the Dev Console `public/` folder.

### API reference tables

Request bodies, response bodies and parameters render as Properties / Type / Description tables
with expand and collapse for nested objects, instead of the plugin's default tree. The table is
`src/components/SchemaTable`, wired in by overriding the theme components `src/theme/Schema` and
`src/theme/ParamsDetails`. API pages show code samples below the content and a link to the API
testing tool instead of the plugin's inline Try it panel (`src/theme/ApiExplorer`). Check these
overrides when upgrading `docusaurus-theme-openapi-docs`.

### API testing tool

`/api-testing` (`src/pages/api-testing.tsx`) is a separate page for sending real requests: pick
an endpoint, enter an access token and merchant ID, fill parameters and body, and see the
response. `sync:spec` writes its endpoint list to `spec/testing-tool.json`. API pages link to it
with `?op=<operationId>`. The token is kept in page memory only.

The tool calls the API from the browser, so the API must allow requests from the portal's origin
(CORS), or requests must go through a proxy. Set `API_TESTING_BASE_URL` at build time to point the
tool at that proxy; otherwise it uses the server URL from the spec.

```bash
API_TESTING_BASE_URL=https://<proxy-host>/openapi/v1 npm run build
```

## Writing rules

- Write for external developers: the flow and how to call the API, nothing more. Do not
  explain token formats or internal behavior.
- Public and English only. Apps only ever see `merchant_id`. Do not mention internal
  identifiers, service names, infrastructure, table or key names, or internal repo paths.
- Do not use the em-dash character.
- `npm run check:public` enforces part of this. Review still matters.
