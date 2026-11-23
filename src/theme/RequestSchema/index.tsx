// The request body as a Body section (Properties / Type / Description table) and an
// Example section, replacing the theme's content-type and schema/example tabs.
import React, {type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';
import Markdown from '@theme/Markdown';
import {sampleRequestFromSchema} from 'docusaurus-plugin-openapi-docs/lib/openapi/createRequestExample';
import ApiSection from '@site/src/components/ApiSection';
import SchemaTable, {type Schema} from '@site/src/components/SchemaTable';

type Example = {summary?: string; value?: unknown};
type Media = {schema?: Schema; example?: unknown; examples?: Record<string, Example>};
type Body = {description?: string; content?: Record<string, Media>};

function examples(media: Media): {name: string | null; value: unknown}[] {
  if (media.examples && Object.keys(media.examples).length > 0) {
    return Object.entries(media.examples).map(([name, ex]) => ({name: ex.summary ?? name, value: ex.value}));
  }
  if (media.example !== undefined) return [{name: null, value: media.example}];
  return [{name: null, value: sampleRequestFromSchema(media.schema as never)}];
}

function RequestBody({body}: {body: Body}): ReactNode {
  const media = body.content?.['application/json'] ?? Object.values(body.content ?? {})[0];
  if (!media?.schema) return null;
  const list = examples(media);
  return (
    <>
      <ApiSection id="request-body" title="Body">
        {body.description && <Markdown>{body.description}</Markdown>}
        <SchemaTable schema={media.schema} />
      </ApiSection>
      <ApiSection id="request-example" title="Example">
        {list.map((ex, i) => (
          <div key={i} className="jbl-example">
            {ex.name && <div className="jbl-example__name">{ex.name}</div>}
            <CodeBlock language="json">{JSON.stringify(ex.value, null, 2)}</CodeBlock>
          </div>
        ))}
      </ApiSection>
    </>
  );
}

export default function RequestSchema({body}: {body?: Body; title?: string}): ReactNode {
  if (!body || Object.keys(body.content ?? {}).length === 0) return null;
  return <BrowserOnly>{() => <RequestBody body={body} />}</BrowserOnly>;
}
