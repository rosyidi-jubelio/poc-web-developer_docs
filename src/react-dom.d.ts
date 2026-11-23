// react-dom ships without types here; only createPortal is used (src/components/SidebarToggle).
declare module 'react-dom' {
  import type {ReactNode} from 'react';
  export function createPortal(children: ReactNode, container: Element): ReactNode;
}
