import { PUBLIC_API_BASE_URL } from './api-config.mjs';

// Terms that must never reach the public portal. Apps only ever see merchant_id.
export const BLOCKED = [
  { re: /tenant_id/i, why: 'internal identifier, apps only see merchant_id' },
  { re: /x-tenant-/i, why: 'internal gateway header' },
  { re: /x-third-party|x-app-code|x-scopes/i, why: 'internal gateway header' },
  { re: /\bredis\b/i, why: 'internal infrastructure' },
  { re: /api-core|app-store-api|open-api-auth/i, why: 'internal service name' },
  { re: /k8s|qm-staging|localhost|127\.0\.0\.1/i, why: 'internal host' },
  { re: /install_state|tenant_info|authcode:|scope_grants|refresh_tokens|app_subscriptions/i, why: 'internal storage name' },
  { re: /\u2014/, why: 'em-dash character is not allowed' },
];

// Words that are allowed but should be reviewed (the public term is "merchant").
export const WARN = [{ re: /\btenants?\b/i, why: 'prefer "merchant" in public text' }];

// The configured API base URL is published on purpose, so it is not reported.
const ALLOWED = [PUBLIC_API_BASE_URL, new URL(PUBLIC_API_BASE_URL).host];

export function scan(text, label) {
  const errors = [];
  const warnings = [];
  text.split('\n').forEach((raw, i) => {
    const line = ALLOWED.reduce((l, a) => l.split(a).join(''), raw);
    for (const { re, why } of BLOCKED) {
      if (re.test(line)) errors.push(`${label}:${i + 1}: ${why}: ${line.trim()}`);
    }
    for (const { re, why } of WARN) {
      if (re.test(line)) warnings.push(`${label}:${i + 1}: ${why}: ${line.trim()}`);
    }
  });
  return { errors, warnings };
}
