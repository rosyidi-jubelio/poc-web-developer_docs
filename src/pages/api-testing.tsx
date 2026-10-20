import React, {useEffect, useMemo, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import EndpointPicker, {MethodBadge} from '@site/src/components/EndpointPicker';
// Written by `npm run sync:spec` from the OpenAPI spec.
import tool from '@site/spec/testing-tool.json';

import styles from './api-testing.module.css';

type Param = {name: string; in: string; required: boolean; description: string; example: unknown};
type Operation = {
  id: string;
  method: string;
  path: string;
  summary: string;
  module: string;
  sub: string | null;
  auth: boolean;
  parameters: Param[];
  body: string | null;
};
type Result = {status: number; statusText: string; ms: number; headers: [string, string][]; body: string};

const operations = tool.operations as Operation[];
const MERCHANT_HEADER = 'x-jbl-merchant-id';

function initialOperation(): Operation {
  if (typeof window !== 'undefined') {
    const id = new URLSearchParams(window.location.search).get('op');
    const found = operations.find((o) => o.id === id);
    if (found) return found;
  }
  return operations.find((o) => o.id === 'getMerchant') ?? operations[0];
}

function pretty(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export default function ApiTesting(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const proxy = (siteConfig.customFields?.apiTestingBaseUrl as string) || '';

  const [op, setOp] = useState<Operation>(operations[0]);
  const [baseUrl, setBaseUrl] = useState(proxy || tool.baseUrl);
  // Kept in memory only: never written to storage or the URL.
  const [token, setToken] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const select = (next: Operation) => {
    setOp(next);
    setValues({});
    setBody(next.body ?? '');
    setResult(null);
    setError(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('op', next.id);
      window.history.replaceState(null, '', url);
    }
  };

  useEffect(() => select(initialOperation()), []);

  const params = op.parameters.filter((p) => p.name.toLowerCase() !== MERCHANT_HEADER);
  const needsMerchant = op.parameters.some((p) => p.name.toLowerCase() === MERCHANT_HEADER);

  const request = useMemo(() => {
    let path = op.path;
    const query = new URLSearchParams();
    const headers: Record<string, string> = {Accept: 'application/json'};
    for (const p of params) {
      const v = values[p.name];
      if (v === undefined || v === '') continue;
      if (p.in === 'path') path = path.replace(`{${p.name}}`, encodeURIComponent(v));
      if (p.in === 'query') query.set(p.name, v);
      if (p.in === 'header') headers[p.name] = v;
    }
    if (op.auth && token) headers.Authorization = `Bearer ${token}`;
    if (needsMerchant && merchantId) headers[MERCHANT_HEADER] = merchantId;
    const hasBody = op.body !== null && op.method !== 'GET';
    if (hasBody) headers['Content-Type'] = 'application/json';
    const qs = query.toString();
    const url = `${baseUrl.replace(/\/$/, '')}${path}${qs ? `?${qs}` : ''}`;
    return {url, headers, body: hasBody ? body : undefined};
  }, [op, params, values, token, merchantId, needsMerchant, baseUrl, body]);

  const missing = [
    ...params.filter((p) => p.required && !values[p.name]).map((p) => p.name),
    ...(op.auth && !token ? ['Access token'] : []),
    ...(needsMerchant && !merchantId ? ['Merchant ID'] : []),
  ];

  const curl = [
    `curl -X ${op.method} "${request.url}"`,
    ...Object.entries(request.headers).map(
      ([k, v]) => `  -H "${k}: ${k === 'Authorization' ? 'Bearer <access_token>' : v}"`,
    ),
    ...(request.body ? [`  -d '${request.body.replace(/\n\s*/g, ' ')}'`] : []),
  ].join(' \\\n');

  const send = async () => {
    setSending(true);
    setResult(null);
    setError(null);
    if (request.body) {
      try {
        JSON.parse(request.body);
      } catch {
        setError('The request body is not valid JSON.');
        setSending(false);
        return;
      }
    }
    const started = performance.now();
    try {
      const res = await fetch(request.url, {
        method: op.method,
        headers: request.headers,
        body: request.body,
      });
      const text = await res.text();
      setResult({
        status: res.status,
        statusText: res.statusText,
        ms: Math.round(performance.now() - started),
        headers: [...res.headers.entries()],
        body: pretty(text),
      });
    } catch {
      setError(
        'The request did not reach the API. Check the base URL and your network. The browser may also block the call if the API does not allow requests from this site.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="API testing tool" description="Send test requests to the Jubelio Open API.">
      <main className={styles.page}>
        <div className={styles.head}>
          <Heading as="h1">API testing tool</Heading>
          <p>
            Pick an endpoint, fill in your access token and merchant ID, and send a request. Your
            token stays in this browser tab and is cleared when you leave the page.
          </p>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <label className={styles.label} htmlFor="op">
              Endpoint
            </label>
            <EndpointPicker
              items={operations}
              value={op.id}
              onChange={(id) => select(operations.find((o) => o.id === id)!)}
            />

            <div className={styles.endpoint}>
              <MethodBadge method={op.method} />
              <code>{op.path}</code>
            </div>

            <h2 className={styles.section}>Base URL</h2>
            <input
              className={styles.input}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              spellCheck={false}
            />

            {(op.auth || needsMerchant) && (
              <>
                <h2 className={styles.section}>Credentials</h2>
                {op.auth && (
                  <Field label="Access token" required>
                    <input
                      className={styles.input}
                      type="password"
                      autoComplete="off"
                      placeholder="jblat_..."
                      value={token}
                      onChange={(e) => setToken(e.target.value.trim())}
                    />
                  </Field>
                )}
                {needsMerchant && (
                  <Field label="Merchant ID" required hint={`Sent as the ${MERCHANT_HEADER} header.`}>
                    <input
                      className={styles.input}
                      placeholder="7K2QX9M4BDH3"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value.trim())}
                    />
                  </Field>
                )}
              </>
            )}

            {['path', 'query', 'header'].map((where) => {
              const list = params.filter((p) => p.in === where);
              if (list.length === 0) return null;
              return (
                <div key={where}>
                  <h2 className={styles.section}>
                    {where === 'header' ? 'Headers' : `${where[0].toUpperCase()}${where.slice(1)} parameters`}
                  </h2>
                  {list.map((p) => (
                    <Field key={p.name} label={p.name} required={p.required} hint={p.description} mono>
                      <input
                        className={styles.input}
                        placeholder={p.example === '' ? '' : String(p.example)}
                        value={values[p.name] ?? ''}
                        onChange={(e) => setValues({...values, [p.name]: e.target.value})}
                      />
                    </Field>
                  ))}
                </div>
              );
            })}

            {op.body !== null && op.method !== 'GET' && (
              <>
                <h2 className={styles.section}>Request body</h2>
                <textarea
                  className={clsx(styles.input, styles.body)}
                  value={body}
                  spellCheck={false}
                  onChange={(e) => setBody(e.target.value)}
                />
              </>
            )}

            <button
              type="button"
              className={clsx('button button--primary button--lg', styles.send)}
              disabled={sending || missing.length > 0}
              onClick={send}>
              {sending ? 'Sending...' : 'Send request'}
            </button>
            {missing.length > 0 && <p className={styles.hint}>Fill in: {missing.join(', ')}.</p>}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.section}>Request</h2>
            <pre className={styles.code}>{curl}</pre>

            <h2 className={styles.section}>Response</h2>
            {!result && !error && <p className={styles.hint}>Send a request to see the response here.</p>}
            {error && <div className={styles.error}>{error}</div>}
            {result && (
              <>
                <div className={styles.status}>
                  <span className={clsx(styles.badge, result.status < 400 ? styles.ok : styles.fail)}>
                    {result.status} {result.statusText}
                  </span>
                  <span className={styles.hint}>{result.ms} ms</span>
                </div>
                <pre className={styles.code}>{result.body || '(empty body)'}</pre>
                {result.headers.length > 0 && (
                  <details className={styles.headers}>
                    <summary>Response headers</summary>
                    <pre className={styles.code}>
                      {result.headers.map(([k, v]) => `${k}: ${v}`).join('\n')}
                    </pre>
                  </details>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}

function Field({
  label,
  required,
  hint,
  mono,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  mono?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.field}>
      <div className={styles.label}>
        <span className={clsx(mono && styles.mono)}>{label}</span>
        {required && <span className={styles.required}>Required</span>}
      </div>
      {children}
      {hint && <div className={styles.fieldHint}>{hint}</div>}
    </div>
  );
}
