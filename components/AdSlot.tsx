"use client";

import { useEffect } from "react";

/**
 * Google AdSense in-content ad slot.
 *
 * Renders nothing until you set two env vars (after AdSense approval):
 *   NEXT_PUBLIC_ADSENSE_CLIENT = ca-pub-XXXXXXXXXXXXXXXX
 *   plus a real `slot` id per placement.
 * This keeps the site clean pre-approval and makes ads a one-config switch on.
 */
export default function AdSlot({
  slot,
  format = "auto",
  className = "",
  style,
}: {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore — script not ready yet */
    }
  }, [client]);

  if (!client) return null;

  return (
    <div className={`my-6 text-center ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
