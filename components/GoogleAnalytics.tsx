"use client";

/* Google Analytics 4 (env-gated). Loads only when NEXT_PUBLIC_GA_ID is set.
   Consent Mode v2 defaults to "denied" (layout <head>) and is granted by
   the cookie banner, so GA respects the user's choice automatically. */

import Script from "next/script";

export default function GoogleAnalytics({ id }: { id: string }) {
  return (
    <>
      {/* gtag.js is 163 KB and costs ~550 ms of main-thread work; on afterInteractive
          it also got a <link rel=preload> in <head>, so it competed with the page's
          own chunks and produced 2-3 long tasks inside the TBT window on every
          template. lazyOnload moves it to idle time after load: no preload, no
          contention, and the config command below is already queued on dataLayer,
          so the page_view still fires with the right parameters when it arrives. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
      <Script id="ga4-init" strategy="afterInteractive"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`,
        }} />
    </>
  );
}
