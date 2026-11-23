// Close icon (mobile sidebar and other dismiss buttons): thin rounded strokes.
import React, {type ComponentProps, type ReactNode} from 'react';

type Props = ComponentProps<'svg'> & {color?: string; strokeWidth?: number};

export default function IconClose({
  width = 18,
  height = 18,
  color = 'currentColor',
  strokeWidth = 1.6,
  ...props
}: Props): ReactNode {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
