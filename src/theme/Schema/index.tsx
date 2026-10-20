// Replaces the openapi theme's tree view of request and response bodies with a
// Properties / Type / Description table.
import React, {type ReactNode} from 'react';
import SchemaTable, {type Schema} from '@site/src/components/SchemaTable';

export default function SchemaNode({
  schema,
  schemaType,
}: {
  schema: Schema;
  schemaType: 'request' | 'response';
}): ReactNode {
  // Rendered inside the theme's <ul>.
  return (
    <li style={{listStyle: 'none', marginLeft: '-1rem'}}>
      {/* Required only matters for what the app sends. */}
      <SchemaTable schema={schema} showRequired={schemaType === 'request'} />
    </li>
  );
}
