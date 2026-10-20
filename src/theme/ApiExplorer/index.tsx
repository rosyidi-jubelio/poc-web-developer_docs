// API pages show code samples only. Sending real requests happens on the separate
// API testing tool page (/api-testing), opened on the same endpoint.
import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import CodeSnippets from '@theme/ApiExplorer/CodeSnippets';
import * as sdk from 'postman-collection';

type Item = {
  operationId?: string;
  method: string;
  postman?: any;
  requestBody?: unknown;
  'x-codeSamples'?: unknown[];
};

export default function ApiExplorer({item}: {item: Item; infoPath?: string}): ReactNode {
  const {frontMatter} = useDoc() as {frontMatter: {mask_credentials?: boolean}};
  const postman = new sdk.Request(
    item.postman
      ? sdk.Request.isRequest(item.postman)
        ? item.postman.toJSON()
        : item.postman
      : {},
  );
  return (
    <>
      <div className="jbl-try-card">
        <div>
          <strong>Try this endpoint</strong>
          <p>Send a real request with your access token in the API testing tool.</p>
        </div>
        <Link
          className="button button--primary"
          to={`/api-testing${item.operationId ? `?op=${encodeURIComponent(item.operationId)}` : ''}`}>
          Open API testing tool
        </Link>
      </div>
      {item.method !== 'event' && (
        <CodeSnippets
          postman={postman}
          codeSamples={item['x-codeSamples'] ?? []}
          maskCredentials={frontMatter.mask_credentials}
          requestBody={item.requestBody}
        />
      )}
    </>
  );
}
