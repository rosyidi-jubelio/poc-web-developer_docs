// Theme components provided by docusaurus-theme-openapi-docs, used by our overrides.
declare module '@theme/Markdown' {
  import type {ReactNode} from 'react';
  export default function Markdown(props: {children?: string}): ReactNode;
}

declare module '@theme/ApiExplorer/CodeSnippets' {
  import type {ReactNode} from 'react';
  export default function CodeSnippets(props: Record<string, unknown>): ReactNode;
}

declare module 'postman-collection';
