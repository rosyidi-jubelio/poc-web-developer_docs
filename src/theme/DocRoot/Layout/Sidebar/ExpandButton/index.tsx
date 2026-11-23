// Unfold button shown in the thin strip left when the docs sidebar is folded.
import React, {type ReactNode} from 'react';
import {SidebarIcon, useTooltip} from '@site/src/components/SidebarToggle';

export default function ExpandButton({toggleSidebar}: {toggleSidebar: () => void}): ReactNode {
  const {ref, tip, handlers} = useTooltip('Unfold');
  return (
    <div className="jbl-sidebar-strip" onClick={toggleSidebar}>
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-label="Unfold sidebar"
        className="jbl-sidebar-toggle"
        onClick={(e) => {
          e.stopPropagation();
          handlers.onMouseLeave();
          toggleSidebar();
        }}
        {...handlers}>
        <SidebarIcon fold={false} />
      </button>
      {tip}
    </div>
  );
}
