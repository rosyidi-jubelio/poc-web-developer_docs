// Mobile navbar toggle: thin rounded lines, the middle one shorter.
import React, {type ComponentProps, type ReactNode} from 'react';

export default function IconMenu({width = 20, height = 20, ...props}: ComponentProps<'svg'>): ReactNode {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 5.5h14M3 10h9M3 14.5h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
