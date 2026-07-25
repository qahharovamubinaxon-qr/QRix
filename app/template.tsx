"use client";

import { useEffect, useRef } from "react";

/** Soft fade+rise on every route change — premium page transition.
 *
 *  It is deliberately NOT applied to the first load. `.qx-page-in` animates
 *  opacity from 0, and an element at opacity 0 is not an LCP candidate, so
 *  wrapping the whole document in it meant every page's LCP waited out the
 *  .45s fade — measured as ~1.4-1.6s of "element render delay" on templates
 *  whose TTFB is only ~335ms. A route transition is for route changes; on the
 *  initial paint it bought nothing and cost the metric on every page.
 *
 *  Module scope, so it survives route changes but resets on a real load:
 *  false only until this document's first Template has mounted.
 */
let navigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  // Read at construction: true for the instance that renders the initial HTML,
  // false for every instance a client navigation creates afterwards. Server and
  // client agree on the first render, so this does not change hydration output.
  const isFirstLoad = useRef(!navigated);
  useEffect(() => {
    navigated = true;
  }, []);

  return <div className={isFirstLoad.current ? undefined : "qx-page-in"}>{children}</div>;
}
