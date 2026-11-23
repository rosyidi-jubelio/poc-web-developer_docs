// Path, query and header parameters as a Name / Type / Description table,
// matching the request and response body tables.
import React, {type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ApiSection from '@site/src/components/ApiSection';
import {FieldTable, flatten, type Row, type Schema} from '@site/src/components/SchemaTable';

type Param = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Schema;
};

const TYPES = ['path', 'query', 'header', 'cookie'] as const;
const TITLES = {path: 'Path', query: 'Query', header: 'Header', cookie: 'Cookie'};

function Params({parameters}: {parameters?: Param[]}): ReactNode {
  return (
    <>
      {TYPES.map((type) => {
        const params = parameters?.filter((p) => p?.in === type) ?? [];
        if (params.length === 0) return null;
        const rows: Row[] = params.map((p) => ({
          path: p.name,
          name: p.name,
          depth: 0,
          schema: p.schema ?? {},
          required: Boolean(p.required),
          hasChildren: false,
          description: p.description ?? flatten(p.schema).description,
        }));
        return (
          <ApiSection key={type} id={`${type}-parameters`} title={TITLES[type]}>
            <FieldTable rows={rows} />
          </ApiSection>
        );
      })}
    </>
  );
}

export default function ParamsDetails(props: {parameters?: Param[]}): ReactNode {
  return <BrowserOnly>{() => <Params {...props} />}</BrowserOnly>;
}
