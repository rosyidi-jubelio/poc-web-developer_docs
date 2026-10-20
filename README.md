# Jubelio App Store Developers (POC)

Public documentation for developers building apps on the Jubelio App Platform, built with
[Docusaurus](https://docusaurus.io/) 3.10 and
[docusaurus-plugin-openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs) 5.2.
Target domain: `developers.jubelio.com`.

## Requirements

- Node.js 20 or newer
- A checkout of the spec source repository next to this one, or a URL to the raw spec (see
  [Spec sync](#spec-sync))

## Run and build

```bash
npm install
npm start          # dev server on http://localhost:3000
npm run build      # static site in build/
npm run serve      # serve build/ locally
```

`npm start` and `npm run build` first run `prepare:api`, which syncs the spec and regenerates
the API reference. `npm run build` also runs `check:public`.

| Script | What it does |
| ------ | ------------ |
| `sync:spec` | Copies or fetches the OpenAPI spec into `spec/openapi.yaml`. |
| `gen:api` | Regenerates the API reference in `docs/api/`, one folder per module and sub-module. |
| `prepare:api` | `sync:spec` then `gen:api`. |
| `check:public` | Fails if hand-written content contains internal details or the em-dash character. |
| `typecheck` | Runs `tsc`. |

## Spec sync

The OpenAPI spec is not copied into this repo by hand. Its source of truth is
`docs/open-api/api/openapi.yaml` in the `app-store-technical-docs` repository.
`scripts/sync-openapi.mjs` pulls it at build time into `spec/openapi.yaml`, and the generated
pages go to `docs/api/`. Both folders are gitignored.

The script picks the first source that is set:

| Variable | Use |
| -------- | --- |
| `OPENAPI_SPEC_URL` | An http(s) URL to the raw YAML, for CI. If `GITHUB_TOKEN` is set it is sent as a bearer token, so a GitHub contents API URL for a private repo works. |
| `OPENAPI_SPEC_PATH` | A local file path. |
| (default) | `../app-store-technical-docs/docs/open-api/api/openapi.yaml`, a sibling checkout. |

Examples:

```bash
# sibling checkout (default)
npm run sync:spec

# another local path
OPENAPI_SPEC_PATH=/path/to/openapi.yaml npm run sync:spec

# CI, private GitHub repo
OPENAPI_SPEC_URL="https://api.github.com/repos/<owner>/app-store-technical-docs/contents/docs/open-api/api/openapi.yaml?ref=main" \
GITHUB_TOKEN=... npm run build
```

While syncing, the script:

1. Replaces `servers` with the public base URL from `PUBLIC_API_BASE_URL`
   (default in `scripts/api-config.mjs`, currently the staging host
   `https://poc-open-api.qm-staging-k8s.jubelio.io/openapi/v1` until production is ready; also
   update the example in `docs/getting-started/first-api-call.md` when it changes). Other servers in the source spec, such as local, are not published.
2. Removes details external developers do not need: every regex `pattern` on fields, and the
   format description of `merchant_id` (it is shown as a plain string).
3. Scans the result with `scripts/public-safety.mjs` and stops the build if it finds internal
   details (internal identifiers, internal headers, service or host names, storage names) or the
   em-dash character. Fix those in the source spec, not here. The word "tenant" only produces a
   warning, since the public term is "merchant".

If the source is missing and a previous `spec/openapi.yaml` exists, the local build keeps the old
copy with a warning. In CI (`CI` is set) a missing source fails the build.

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
scripts/
  sync-openapi.mjs         Spec sync and module split
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
