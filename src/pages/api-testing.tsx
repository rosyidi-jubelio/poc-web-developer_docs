import React, {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import EndpointPicker from '@site/src/components/EndpointPicker';
import JsonEditor from '@site/src/components/JsonEditor';
// Written by `npm run sync:spec` from the OpenAPI spec.
import tool from '@site/spec/testing-tool.json';

import styles from './api-testing.module.css';

type Param = {name: string; in: string; required: boolean; type: string; description: string; example: unknown};
type Operation = {
  id: string;
  doc: string | null;
  method: string;
  path: string;
  summary: string;
  module: string;
  sub: string | null;
  auth: boolean;
  parameters: Param[];
  body: string | null;
};
type JsonMode = 'pretty' | 'minified';
type Result = {status: number; statusText: string; ms: number; headers: [string, string][]; body: string};

const operations = tool.operations as Operation[];
const MERCHANT_HEADER = 'x-jbl-merchant-id';
const TOKEN_HINT =
  'Your access token from `POST /oauth/token`. Sent as the `Authorization: Bearer` header. It stays in this browser tab and is cleared when you leave the page.';

function initialOperation(): Operation {
  if (typeof window !== 'undefined') {
    const id = new URLSearchParams(window.location.search).get('op');
    const found = operations.find((o) => o.id === id);
    if (found) return found;
  }
  return operations.find((o) => o.id === 'getMerchant') ?? operations[0];
}

function formatJson(text: string, mode: JsonMode) {
  try {
    return JSON.stringify(JSON.parse(text), null, mode === 'pretty' ? 2 : 0);
  } catch {
    return null;
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
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [responseMode, setResponseMode] = useState<JsonMode>('pretty');

  const formatBody = (mode: JsonMode) => {
    if (!body.trim()) return;
    const formatted = formatJson(body, mode);
    if (formatted === null) {
      setBodyError('The request body is not valid JSON.');
      return;
    }
    setBody(formatted);
    setBodyError(null);
  };

  const select = (next: Operation) => {
    setOp(next);
    setValues({});
    setBody(next.body ?? '');
    setBodyError(null);
    setResult(null);
    setError(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('op', next.id);
      window.history.replaceState(null, '', url);
    }
  };

  useEffect(() => select(initialOperation()), []);

  const merchantParam = op.parameters.find((p) => p.name.toLowerCase() === MERCHANT_HEADER);
  const params = op.parameters.filter((p) => p.name.toLowerCase() !== MERCHANT_HEADER);
  const hasBody = op.body !== null && op.method !== 'GET';

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
    if (merchantParam && merchantId) headers[MERCHANT_HEADER] = merchantId;
    if (hasBody) headers['Content-Type'] = 'application/json';
    const qs = query.toString();
    const url = `${baseUrl.replace(/\/$/, '')}${path}${qs ? `?${qs}` : ''}`;
    return {url, headers, body: hasBody ? body : undefined};
  }, [op, params, values, token, merchantId, merchantParam, hasBody, baseUrl, body]);

  const missing = [
    ...(op.auth && !token ? ['access_token'] : []),
    ...(merchantParam && !merchantId ? [MERCHANT_HEADER] : []),
    ...params.filter((p) => p.required && !values[p.name]).map((p) => p.name),
  ];

  const curl = [
    `curl -X ${op.method} "${request.url}"`,
    ...Object.entries(request.headers).map(
      ([k, v]) => `  -H "${k}: ${k === 'Authorization' ? 'Bearer <access_token>' : v}"`,
    ),
    ...(request.body ? [`  -d '${formatJson(request.body, 'minified') ?? request.body}'`] : []),
  ].join(' \\\n');

  const responseText = result ? formatJson(result.body, responseMode) : null;

  const send = async () => {
    setSending(true);
    setResult(null);
    setError(null);
    if (request.body) {
      try {
        JSON.parse(request.body);
      } catch {
        setBodyError('The request body is not valid JSON.');
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
        body: text,
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
    <Layout title="API Testing Tool" description="Send test requests to the Jubelio Open API.">
      <main className={styles.page}>
        <div className={styles.head}>
          <Heading as="h1">API Testing Tool</Heading>
          <p>
            Pick an endpoint, fill in your access token and merchant ID, and send a real request to the
            Jubelio Open API.
          </p>
        </div>

        <div className={styles.card}>
          <section className={styles.left}>
            <div className={styles.leftTop}>
              <EndpointPicker
                items={operations}
                value={op.id}
                onChange={(id) => select(operations.find((o) => o.id === id)!)}
              />
              {op.doc && (
                <div className={styles.docLink}>
                  <Link to={op.doc}>View API doc ↗</Link>
                </div>
              )}
              <div className={styles.inline}>
                <label className={styles.inlineLabel} htmlFor="base-url">
                  Base URL
                </label>
                <input
                  id="base-url"
                  className={styles.input}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </div>

            <div className={styles.leftScroll}>
              {(op.auth || merchantParam) && (
                <>
                  <h2 className={styles.section}>Common parameters</h2>
                  <div className={styles.box}>
                    {op.auth && (
                      <Field name="access_token" type="string" required hint={TOKEN_HINT}>
                        <input
                          className={styles.input}
                          type="password"
                          autoComplete="new-password"
                          placeholder="jblat_..."
                          value={token}
                          onChange={(e) => setToken(e.target.value.trim())}
                        />
                      </Field>
                    )}
                    {merchantParam && (
                      <Field
                        name={MERCHANT_HEADER}
                        type={merchantParam.type}
                        required
                        hint={merchantParam.description}>
                        <input
                          className={styles.input}
                          placeholder={String(merchantParam.example || '7K2QX9M4BDH3')}
                          value={merchantId}
                          onChange={(e) => setMerchantId(e.target.value.trim())}
                        />
                      </Field>
                    )}
                  </div>
                </>
              )}

              {['path', 'query', 'header'].map((where) => {
                const list = params.filter((p) => p.in === where);
                if (list.length === 0) return null;
                return (
                  <div key={where}>
                    <h2 className={styles.section}>
                      {where === 'header' ? 'Header parameters' : `${where[0].toUpperCase()}${where.slice(1)} parameters`}
                    </h2>
                    {list.map((p) => (
                      <Field key={p.name} name={p.name} type={p.type} required={p.required} hint={p.description}>
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

              {hasBody && (
                <>
                  <div className={styles.sectionBar}>
                    <h2 className={styles.section}>Request body</h2>
                    <div className={styles.toggle}>
                      <button type="button" onClick={() => formatBody('pretty')}>
                        Prettify
                      </button>
                      <button type="button" onClick={() => formatBody('minified')}>
                        Minify
                      </button>
                    </div>
                  </div>
                  <JsonEditor
                    value={body}
                    invalid={bodyError !== null}
                    onChange={(next) => {
                      setBody(next);
                      setBodyError(null);
                    }}
                  />
                  {bodyError && <p className={styles.fieldError}>{bodyError}</p>}
                </>
              )}
            </div>

            <div className={styles.leftFooter}>
              <span className={styles.hint}>{missing.length > 0 && `Fill in: ${missing.join(', ')}`}</span>
              <button
                type="button"
                className="button button--primary"
                disabled={sending || missing.length > 0}
                onClick={send}>
                {sending ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </section>

          <section className={styles.right}>
            <div className={styles.blockHead}>
              <h2 className={styles.section}>
                Request demo <span className={styles.muted}>(cURL)</span>
              </h2>
              <CopyButton text={curl} />
            </div>
            <pre className={styles.code}>{curl}</pre>

            <div className={styles.blockHead}>
              <div>
                <h2 className={styles.section}>Response</h2>
                <div className={styles.status}>
                  Status:
                  {result && (
                    <>
                      <span className={clsx(styles.badge, result.status < 400 ? styles.ok : styles.fail)}>
                        {result.status} {result.statusText}
                      </span>
                      <span>{result.ms} ms</span>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                {responseText !== null && (
                  <div className={styles.toggle}>
                    {(['pretty', 'minified'] as JsonMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={clsx(responseMode === mode && styles.active)}
                        onClick={() => setResponseMode(mode)}>
                        {mode === 'pretty' ? 'Pretty' : 'Minified'}
                      </button>
                    ))}
                  </div>
                )}
                <CopyButton text={result ? responseText ?? result.body : ''} />
              </div>
            </div>

            <div className={styles.responseArea}>
              {error && <div className={styles.error}>{error}</div>}
              {!result && !error && (
                <div className={styles.placeholder}>Send a request to see the response here.</div>
              )}
              {result && <ResponseBody text={result.body} formatted={responseText} pretty={responseMode === 'pretty'} />}
              {result && result.headers.length > 0 && (
                <details className={styles.headers}>
                  <summary>Response headers</summary>
                  <pre className={styles.code}>{result.headers.map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>
                </details>
              )}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

function ResponseBody({text, formatted, pretty}: {text: string; formatted: string | null; pretty: boolean}): ReactNode {
  if (!text) return <pre className={styles.code}>(empty body)</pre>;
  if (formatted === null) return <pre className={styles.code}>{text}</pre>;
  return (
    <div className={styles.json}>
      <CodeBlock language="json" showLineNumbers={pretty}>
        {formatted}
      </CodeBlock>
    </div>
  );
}

function CopyButton({text}: {text: string}): ReactNode {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className={styles.copy} disabled={!text} onClick={copy}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
      </svg>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function RichText({text}: {text: string}): ReactNode {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para, i) => (
      <p key={i}>
        {para
          .replace(/\n/g, ' ')
          .split('`')
          .map((part, j) => (j % 2 === 1 ? <code key={j}>{part}</code> : part))}
      </p>
    ));
}

function Tooltip({text}: {text: string}): ReactNode {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{left: number; top: number; above: boolean} | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(320, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 16));
    const above = r.top > window.innerHeight / 2;
    setPos({left, top: above ? r.top - 8 : r.bottom + 8, above});
  };
  return (
    <>
      <button
        ref={ref}
        type="button"
        className={styles.help}
        aria-label="Description"
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        onFocus={show}
        onBlur={() => setPos(null)}>
        ?
      </button>
      {pos && (
        <div
          role="tooltip"
          className={styles.tooltip}
          style={{left: pos.left, top: pos.top, transform: pos.above ? 'translateY(-100%)' : undefined}}>
          <RichText text={text} />
        </div>
      )}
    </>
  );
}

function Field({
  name,
  type,
  required,
  hint,
  children,
}: {
  name: string;
  type: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={styles.field}>
      <div className={styles.label}>
        <span>
          {name} <span className={styles.type}>({type})</span>
        </span>
        {!required && <span className={styles.optional}>(Optional)</span>}
        {hint && <Tooltip text={hint} />}
      </div>
      {children}
    </div>
  );
}
