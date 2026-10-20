#!/usr/bin/env node
// Scans hand-written content for internal details and the em-dash character.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from './public-safety.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['docs', 'src'];
const skip = new Set([path.join(root, 'docs', 'api')]);
const files = ['docusaurus.config.ts', 'sidebars.ts'];

async function walk(dir) {
  if (skip.has(dir)) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else if (/\.(mdx?|tsx?|css)$/.test(entry.name)) files.push(path.relative(root, p));
  }
}
for (const d of dirs) await walk(path.join(root, d));

let failed = false;
for (const f of files) {
  const { errors, warnings } = scan(await readFile(path.join(root, f), 'utf8'), f);
  warnings.forEach((w) => console.warn(`warn  ${w}`));
  errors.forEach((e) => console.error(`error ${e}`));
  if (errors.length) failed = true;
}
if (failed) process.exit(1);
console.log(`[check-public] ${files.length} files clean`);
