// The success response only: its fields as a Properties / Type / Description table, with an
// example right below. Errors share the envelope described in the API overview; response
// headers are left out.
import React, {type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import {sampleResponseFromSchema} from 'docusaurus-plugin-openapi-docs/lib/openapi/createResponseExample';
import ApiSection from '@site/src/components/ApiSection';
import SchemaTable, {type Schema} from '@site/src/components/SchemaTable';

type Media = {schema?: Schema; example?: unknown; examples?: Record<string, {value?: unknown}>};
type Response = {description?: string; content?: Record<string, Media>};

function example(media: Media): unknown {
  if (media.example !== undefined) return media.example;
  const first = media.examples && Object.values(media.examples)[0]?.value;
  if (first !== undefined) return first;
  return sampleResponseFromSchema(media.schema as never);
}

function Success({
  code,
  response,
  showCode,
  first,
}: {
  code: string;
  response: Response;
  showCode: boolean;
  first: boolean;
}): ReactNode {
  const media = response.content?.['application/json'] ?? Object.values(response.content ?? {})[0];
  const suffix = first ? '' : `-${code}`;
  return (
    <div className="jbl-response">
      {showCode && (
        <div className="jbl-response__code">
          <span className="jbl-status-badge">{code}</span>
          {response.description}
        </div>
      )}
      {media?.schema ? (
        <>
          <ApiSection id={`response-parameters${suffix}`} title="Parameters">
            <SchemaTable schema={media.schema} showRequired={false} />
          </ApiSection>
          <ApiSection id={`response-example${suffix}`} title="Example">
            <CodeBlock language="json">{JSON.stringify(example(media), null, 2)}</CodeBlock>
          </ApiSection>
        </>
      ) : (
        <p className="jbl-response__empty">No response body.</p>
      )}
    </div>
  );
}

export default function StatusCodes({responses}: {responses: Record<string, Response>; label?: string; id?: string}): ReactNode {
  const codes = Object.keys(responses ?? {});
  const success = codes.filter((c) => c.startsWith('2'));
  const shown = success.length > 0 ? success : codes.slice(0, 1);
  return (
    <>
      <Heading as="h2" id="response" className="openapi-tabs__heading">
        Response
      </Heading>
      <BrowserOnly>
        {() => (
          <>
            {shown.map((code, i) => (
              <Success
                key={code}
                code={code}
                response={responses[code]}
                showCode={shown.length > 1}
                first={i === 0}
              />
            ))}
          </>
        )}
      </BrowserOnly>
    </>
  );
}
