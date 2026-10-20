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

declare module '@theme/ApiItem/hooks' {
  export function useTypedDispatch(): (action: unknown) => void;
  export function useTypedSelector<T>(selector: (state: any) => T): T;
}

declare module '@theme/ApiExplorer/Server/slice' {
  export function setServer(value: string): unknown;
}
