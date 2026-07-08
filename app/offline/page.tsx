import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Offline",
  description: "You are offline.",
  path: "/offline",
  noindex: true,
});

/** Offline fallback served by the service worker when the network is down. */
export default function OfflinePage() {
  return (
    <main className="max-w-md mx-auto px-5 py-32 text-center">
      <p className="text-5xl mb-4" role="img" aria-label="offline">📡</p>
      <h1 className="font-display text-2xl font-extrabold" style={{ color: "var(--text)" }}>You’re offline</h1>
      <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
        QRix works best online, but pages you visited recently are still available.
        Your on-device tools keep working — reconnect to sync everything else.
      </p>
      <a href="/" className="qx-btn inline-flex mt-6">Try again</a>
    </main>
  );
}
