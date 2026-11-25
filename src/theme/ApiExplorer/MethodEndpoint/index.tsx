// API page header under the title: the required OAuth scope, the endpoint URL with a Copy
// button, and a link to the API testing tool on the same endpoint.
import React, {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
// Written by `npm run sync:spec` from the OpenAPI spec.
import tool from '@site/spec/testing-tool.json';

type Scope = {code: string; name: string};
type Operation = {
  id: string;
  method: string;
  path: string;
  baseUrl: string | null;
  auth: boolean;
  scopes: Scope[];
};

const operations = tool.operations as Operation[];

function CopyUrl({text}: {text: string}): ReactNode {
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
    <button type="button" className="jbl-endpoint__copy" onClick={copy}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
      </svg>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function MethodEndpoint({method, path}: {method: string; path: string; context?: string}): ReactNode {
  if (method === 'event') return null;
  const op = operations.find((o) => o.method === method.toUpperCase() && o.path === path);
  const url = `${(op?.baseUrl ?? tool.baseUrl).replace(/\/$/, '')}${path}`;
  return (
    <div className="jbl-endpoint-header">
      {op?.auth && (
        <div className="jbl-scope">
          <span className="jbl-scope__label">Required scope:</span>
          {op.scopes.length > 0 ? (
            op.scopes.map((s) => (
              <span key={s.code} className="jbl-scope__chip">
                {s.name} (<code>{s.code}</code>)
              </span>
            ))
          ) : (
            <span className="jbl-scope__none">None, any valid access token</span>
          )}
        </div>
      )}
      <div className="jbl-endpoint-row">
        <div className="jbl-endpoint">
          <span className={`jbl-endpoint__method jbl-endpoint__method--${method.toLowerCase()}`}>
            {method === 'delete' ? 'DEL' : method.toUpperCase()}
          </span>
          <code className="jbl-endpoint__url">{url}</code>
          <CopyUrl text={url} />
        </div>
        {op && (
          <Link className="jbl-endpoint__tool" to={`/api-testing?op=${encodeURIComponent(op.id)}`}>
            API Testing Tool
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
