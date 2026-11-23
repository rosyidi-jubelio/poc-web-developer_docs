// Fold and unfold buttons for the docs sidebar: a list icon with an arrow, and a dark
// tooltip. The tooltip is portaled to the body because the sidebar clips its content.
import React, {useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

export function SidebarIcon({fold}: {fold: boolean}): ReactNode {
  return (
    <svg className="jbl-sidebar-toggle__icon" viewBox="0 0 24 24" aria-hidden>
      {fold ? <path d="M7 6 3 9.5 7 13" /> : <path d="M3 6l4 3.5L3 13" />}
      <path d="M10 6h11M10 9.5h11M10 13h11M3 17.5h18" />
    </svg>
  );
}

export function useTooltip(label: string) {
  const ref = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{left: number; top: number} | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({left: r.right + 8, top: r.top + r.height / 2});
  };
  const hide = () => setPos(null);
  const tip =
    pos && typeof document !== 'undefined'
      ? createPortal(
          <div role="tooltip" className="jbl-sidebar-tooltip" style={{left: pos.left, top: pos.top}}>
            {label}
          </div>,
          document.body,
        )
      : null;
  return {ref, tip, handlers: {onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide}};
}
