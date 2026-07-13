"use client";

/* Google Analytics 4 (env-gated). Loads only when NEXT_PUBLIC_GA_ID is set.
   Consent Mode v2 defaults to "denied" (layout <head>) and is granted by
   the cookie banner, so GA respects the user's choice automatically. */

import Script from "next/script";

export default function GoogleAnalytics({ id }: { id: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`,
        }} />
    </>
  );
}
