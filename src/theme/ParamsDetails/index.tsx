// Path, query and header parameters as a Name / Type / Description table,
// matching the request and response body tables.
import React, {type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {FieldTable, flatten, type Row, type Schema} from '@site/src/components/SchemaTable';

type Param = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: Schema;
};

const TYPES = ['path', 'query', 'header', 'cookie'] as const;
const TITLES = {path: 'Path parameters', query: 'Query parameters', header: 'Headers', cookie: 'Cookies'};

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
          <div key={type} className="margin-bottom--md">
            <h3 className="openapi-markdown__details-summary-header-params">{TITLES[type]}</h3>
            <FieldTable rows={rows} nameHeader="Name" />
          </div>
        );
      })}
    </>
  );
}

export default function ParamsDetails(props: {parameters?: Param[]}): ReactNode {
  return <BrowserOnly>{() => <Params {...props} />}</BrowserOnly>;
}
