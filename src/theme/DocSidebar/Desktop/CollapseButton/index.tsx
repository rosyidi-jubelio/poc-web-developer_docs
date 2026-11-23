// Fold button at the top of the docs sidebar (sidebar.hideable in docusaurus.config.ts).
import React, {type ReactNode} from 'react';
import {SidebarIcon, useTooltip} from '@site/src/components/SidebarToggle';

export default function CollapseButton({onClick}: {onClick: React.MouseEventHandler}): ReactNode {
  const {ref, tip, handlers} = useTooltip('Fold');
  return (
    <>
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-label="Fold sidebar"
        className="jbl-sidebar-toggle jbl-sidebar-toggle--fold"
        onClick={(e) => {
          handlers.onMouseLeave();
          onClick(e);
        }}
        {...handlers}>
        <SidebarIcon fold />
      </button>
      {tip}
    </>
  );
}
