#!/usr/bin/env node
// Pulls the Open API spec from its source of truth into spec/openapi.yaml (gitignored),
// replaces the server list with the public one, and refuses to continue if the spec
// contains internal details. It also splits the spec into one file per module or
// sub-module under spec/modules/, listed in spec/modules.json, so the API reference
// mirrors the module structure (see scripts/api-modules.mjs).
//
// Source, first match wins:
//   OPENAPI_SPEC_URL   http(s) URL to the raw YAML. GITHUB_TOKEN is sent if set.
//   OPENAPI_SPEC_PATH  local file path.
//   default            ../app-store-technical-docs/docs/open-api/api/openapi.yaml
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { scan } from './public-safety.mjs';
import { MODULES, SUBMODULES, subLabel } from './api-modules.mjs';
import { PUBLIC_API_BASE_URL } from './api-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'spec', 'openapi.yaml');
const defaultPath = path.resolve(root, '..', 'app-store-technical-docs', 'docs', 'open-api', 'api', 'openapi.yaml');
const publicServer = PUBLIC_API_BASE_URL;

async function load() {
  const url = process.env.OPENAPI_SPEC_URL;
  if (url) {
    const headers = process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.raw' }
      : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText}`);
    return { text: await res.text(), from: url };
  }
  const file = process.env.OPENAPI_SPEC_PATH ? path.resolve(process.env.OPENAPI_SPEC_PATH) : defaultPath;
  if (!existsSync(file)) {
    if (existsSync(outFile) && !process.env.CI) {
      console.warn(`[sync-openapi] ${file} not found, keeping the existing spec/openapi.yaml`);
      return null;
    }
    throw new Error(`spec not found at ${file}. Set OPENAPI_SPEC_PATH or OPENAPI_SPEC_URL.`);
  }
  return { text: await readFile(file, 'utf8'), from: file };
}

const src = await load();
if (src) {
  const doc = YAML.parse(src.text);
  doc.servers = [{ url: publicServer }];
  toPublic(doc);
  const out = YAML.stringify(doc, { lineWidth: 0 });

  const { errors, warnings } = scan(out, 'spec/openapi.yaml');
  warnings.forEach((w) => console.warn(`[sync-openapi] warn ${w}`));
  if (errors.length) {
    errors.forEach((e) => console.error(`[sync-openapi] error ${e}`));
    console.error('[sync-openapi] the spec contains internal details; fix it at the source.');
    process.exit(1);
  }

  await rm(path.dirname(outFile), { recursive: true, force: true });
  await mkdir(path.join(path.dirname(outFile), 'modules'), { recursive: true });
  await writeFile(outFile, out);
  await writeModules(doc);
  console.log(`[sync-openapi] ${doc.info?.title} ${doc.info?.version} synced from ${src.from}`);
}

// Splits the spec by module (tag) and sub-module (first path segment).
async function writeModules(doc) {
  const groups = new Map();
  for (const [p, item] of Object.entries(doc.paths ?? {})) {
    const tags = new Set(
      Object.values(item).flatMap((op) => (op && typeof op === 'object' && op.tags) || []),
    );
    if (tags.size !== 1) throw new Error(`${p}: every operation needs exactly one module tag, got [${[...tags]}]`);
    const tag = [...tags][0];
    const mod = MODULES[tag];
    if (!mod) throw new Error(`${p}: tag "${tag}" is not mapped in scripts/api-modules.mjs`);
    if (mod.publish === false) continue;
    const seg = p.split('/')[1];
    const key = mod.flat ? mod.dir : `${mod.dir}/${seg}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key.replace('/', '-'),
        dir: key,
        module: { dir: mod.dir, label: mod.label, position: mod.position },
        sub: mod.flat ? null : { label: subLabel(seg), position: SUBMODULES[seg]?.position },
        paths: {},
      });
    }
    groups.get(key).paths[p] = item;
  }

  const manifest = [];
  for (const g of groups.values()) {
    const title = g.sub ? `${g.module.label}: ${g.sub.label}` : g.module.label;
    const part = { ...doc, info: { ...doc.info, title }, paths: g.paths };
    delete part.tags;
    const specPath = `spec/modules/${g.id}.yaml`;
    await writeFile(path.join(root, specPath), YAML.stringify(part, { lineWidth: 0 }));
    manifest.push({ id: g.id, specPath, outputDir: `docs/api/${g.dir}`, module: g.module, sub: g.sub });
  }
  await writeFile(path.join(root, 'spec', 'modules.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeTestingTool(doc, groups);
  console.log(`[sync-openapi] ${manifest.length} module specs: ${manifest.map((m) => m.id).join(', ')}`);
}

// Removes details external developers do not need: regex patterns on fields, and the
// format of merchant_id (treat it as an opaque string).
function toPublic(doc) {
  const strip = (node) => {
    if (Array.isArray(node)) return node.forEach(strip);
    if (!node || typeof node !== 'object') return;
    if (typeof node.pattern === 'string') delete node.pattern;
    Object.values(node).forEach(strip);
  };
  strip(doc);
  const merchantId = doc.components?.schemas?.MerchantId;
  if (merchantId) {
    merchantId.description =
      'The merchant your app acts on. You receive it with the access token from `POST /oauth/token`.';
  }
}

// Endpoint list for the API testing tool page (src/pages/api-testing.tsx).
async function writeTestingTool(doc, groups) {
  const deref = (node, seen = new Set()) => {
    if (Array.isArray(node)) return node.map((n) => deref(n, seen));
    if (!node || typeof node !== 'object') return node;
    if (typeof node.$ref === 'string') {
      if (seen.has(node.$ref)) return {};
      const target = node.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], doc);
      return deref(target, new Set([...seen, node.$ref]));
    }
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, deref(v, seen)]));
  };
  const sample = (schema, depth = 0) => {
    if (!schema || depth > 5) return null;
    if (schema.example !== undefined) return schema.example;
    if (schema.default !== undefined) return schema.default;
    if (schema.enum) return schema.enum[0];
    if (schema.allOf) return Object.assign({}, ...schema.allOf.map((s) => sample(s, depth + 1)));
    const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== 'null') : schema.type;
    if (type === 'object' || schema.properties) {
      return Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([k, v]) => [k, sample(v, depth + 1)]),
      );
    }
    if (type === 'array') return [sample(schema.items, depth + 1)];
    return { string: '', integer: 0, number: 0, boolean: false }[type] ?? null;
  };

  const operations = [];
  for (const g of groups.values()) {
    for (const [p, rawItem] of Object.entries(g.paths)) {
      const item = deref(rawItem);
      for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        const op = item[method];
        if (!op) continue;
        const parameters = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((prm) => ({
          name: prm.name,
          in: prm.in,
          required: Boolean(prm.required),
          description: prm.description ?? prm.schema?.description ?? '',
          example: prm.example ?? prm.schema?.example ?? prm.schema?.default ?? '',
        }));
        const json = op.requestBody?.content?.['application/json'];
        const firstExample = json?.examples && Object.values(json.examples)[0]?.value;
        const body = json ? firstExample ?? json.example ?? sample(json.schema) : undefined;
        operations.push({
          id: op.operationId ?? `${method}-${p}`,
          method: method.toUpperCase(),
          path: p,
          summary: op.summary ?? p,
          module: g.module.label,
          sub: g.sub?.label ?? null,
          auth: !(Array.isArray(op.security) && op.security.length === 0),
          parameters,
          body: body === undefined ? null : JSON.stringify(body, null, 2),
        });
      }
    }
  }
  const tool = { baseUrl: doc.servers?.[0]?.url ?? '', operations };
  await writeFile(path.join(root, 'spec', 'testing-tool.json'), JSON.stringify(tool, null, 2) + '\n');
}
