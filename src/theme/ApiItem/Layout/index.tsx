// Every doc renders through ApiItem (docItemComponent in docusaurus.config.ts). API pages hide
// the markdown table of contents, so they get one on the right built from the sections the page
// renders. Guide pages keep the theme's own table of contents; the column widths match.
import React, {type ReactNode} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Layout from '@theme-original/ApiItem/Layout';
import ApiToc from '@site/src/components/ApiToc';

export default function ApiItemLayout(props: {children?: ReactNode}): ReactNode {
  const {frontMatter} = useDoc() as {frontMatter: {api?: unknown}};
  if (!frontMatter.api) return <Layout {...props} />;
  return (
    <div className="row">
      <div className="col jbl-api-main">
        <Layout {...props} />
      </div>
      <div className="col col--3 jbl-api-toc-col">
        <ApiToc />
      </div>
    </div>
  );
}
