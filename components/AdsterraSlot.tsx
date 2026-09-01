"use client";

import { useEffect, useRef } from "react";

/**
 * Adsterra ad units.
 *
 * Two formats, two very different integrations:
 *
 *   native  — a script that fills a <div> whose id is `container-<key>`.
 *   banner  — a script that reads a GLOBAL `atOptions` object set just before
 *             it loads. That global is the problem: two banners on one page
 *             overwrite each other and the second one renders the first one's
 *             size, or nothing. So each banner is rendered inside its own
 *             srcdoc iframe, which gives it a private `window` and makes the
 *             collision structurally impossible rather than merely unlikely.
 *
 * Both are env-gated and render NOTHING when unset, so the site stays clean if
 * the account is ever paused and ads can be switched off in one variable
 * without a code change:
 *
 *   NEXT_PUBLIC_ADSTERRA_NATIVE_SRC   full invoke.js URL (the subdomain is
 *                                     account-specific, so the whole URL is
 *                                     configured rather than just the key)
 *   NEXT_PUBLIC_ADSTERRA_BANNER_KEY   the 300x250 unit's key
 *
 * These keys are NOT secrets — they are visible in the page source of every
 * site running these ads. They live in env for switchability, not secrecy.
 */

/** Adsterra's native unit derives its container id from the key in its URL. */
function keyFromSrc(src: string): string {
  const m = src.match(/\/([0-9a-f]{16,})\/invoke\.js/i);
  return m ? m[1] : "";
}

function NativeUnit({ src }: { src: string }) {
  const host = useRef<HTMLDivElement>(null);
  const key = keyFromSrc(src);

  useEffect(() => {
    const el = host.current;
    /* React 18+ runs effects twice in development. Without this guard the
       script is injected twice and Adsterra renders the unit twice. */
    if (!el || !key || el.querySelector("script")) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = src;
    el.appendChild(s);
  }, [src, key]);

  if (!key) return null;
  return (
    <div ref={host} className="my-8 flex justify-center">
      <div id={`container-${key}`} />
    </div>
  );
}

function BannerUnit({ adKey, width, height }: { adKey: string; width: number; height: number }) {
  /* Built as a document rather than injected into ours: `atOptions` is global,
     and a private window is the only way two units can coexist. The closing
     script tags are split so this string cannot terminate the surrounding
     <script> when Next inlines it. */
  const doc = [
    "<!doctype html><html><head><meta charset='utf-8'>",
    "<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>",
    "</head><body>",
    `<script>atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};<\/script>`,
    `<script src="https://www.highrevenueformat.com/${adKey}/invoke.js"><\/script>`,
    "</body></html>",
  ].join("");

  return (
    <div className="my-8 flex justify-center">
      <iframe
        srcDoc={doc}
        width={width}
        height={height}
        style={{ border: 0, display: "block", maxWidth: "100%" }}
        scrolling="no"
        loading="lazy"
        title="Advertisement"
        aria-label="Advertisement"
      />
    </div>
  );
}

export default function AdsterraSlot({
  format = "native",
  width = 300,
  height = 250,
}: {
  format?: "native" | "banner";
  width?: number;
  height?: number;
}) {
  const nativeSrc = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC;
  const bannerKey = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY;

  if (format === "banner") {
    return bannerKey ? <BannerUnit adKey={bannerKey} width={width} height={height} /> : null;
  }
  return nativeSrc ? <NativeUnit src={nativeSrc} /> : null;
}
