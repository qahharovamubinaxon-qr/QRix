"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface it in the console for debugging; no PII is sent anywhere.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <div className="text-7xl mb-3">⚠️</div>
      <h1 className="font-display text-4xl font-extrabold mb-2" style={{ color: "var(--text)" }}>Something went wrong</h1>
      <p className="text-sm mb-7 max-w-md" style={{ color: "var(--text-muted)" }}>
        An unexpected error occurred. Your files never left your device — nothing was lost. Try again, or head back home.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset} className="qx-btn-hero !text-sm">Try again</button>
        <Link href="/" className="qx-btn-hero-ghost !text-sm">Go home</Link>
      </div>
    </main>
  );
}
