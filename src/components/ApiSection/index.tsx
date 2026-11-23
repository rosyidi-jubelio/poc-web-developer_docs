// One section of an API page (Header, Query, Body, Parameters, Example): a heading that
// the right-hand table of contents lists, and a Show less / Show more toggle.
import React, {useState, type ReactNode} from 'react';
import Heading from '@theme/Heading';

export default function ApiSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): ReactNode {
  const [open, setOpen] = useState(true);
  return (
    <section className="jbl-api-section">
      <div className="jbl-api-section__head">
        <Heading as="h3" id={id} data-toc={title}>
          {title}
        </Heading>
        <button
          type="button"
          className="jbl-api-section__toggle"
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onClick={() => setOpen(!open)}>
          {open ? 'Show less' : 'Show more'}
          <span className={open ? 'jbl-chevron jbl-chevron--up' : 'jbl-chevron'} aria-hidden />
        </button>
      </div>
      <div
        id={`${id}-content`}
        className={open ? 'jbl-collapse jbl-collapse--open' : 'jbl-collapse'}
        aria-hidden={!open}
        inert={!open}>
        <div className="jbl-collapse__inner">{children}</div>
      </div>
    </section>
  );
}
