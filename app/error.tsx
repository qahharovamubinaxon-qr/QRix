"use client";

import { useEffect } from "react";
import Link from "next/link";
import Illustration from "@/components/Illustrations";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface it in the console for debugging; no PII is sent anywhere.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5 relative">
      <div className="qx-aurora-bg" aria-hidden />
      <div className="relative">
        <Illustration name="error" size={140} className="mx-auto mb-5" />
        <p className="text-[12px] font-bold uppercase tracking-[.2em] mb-2" style={{ color: "var(--text-faint)" }}>Unexpected error</p>
        <h1 className="font-display text-4xl font-extrabold mb-3" style={{ color: "var(--text)" }}>
          That wasn&apos;t supposed to happen
        </h1>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Your files never left your device — nothing was lost. A quick retry usually fixes it.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="qx-btn-hero !text-sm">Try again</button>
          <Link href="/" className="qx-btn-hero-ghost !text-sm">Go home</Link>
        </div>
        {error.digest && <p className="text-[10px] mt-6" style={{ color: "var(--text-faint)" }}>Reference: <code>{error.digest}</code></p>}
      </div>
    </main>
  );
}
