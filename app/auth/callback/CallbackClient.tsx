"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * OAuth return point (Google → Supabase → here).
 * supabase-js auto-exchanges the ?code= on load; we wait for the session,
 * mirror it into server cookies and forward to the destination.
 */
export default function CallbackClient() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const url = new URL(window.location.href);
      const next = url.searchParams.get("next") || "/dashboard";
      const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");
      if (oauthError) { setError(oauthError); return; }

      const finish = async (session: { access_token: string; refresh_token: string }) => {
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
          });
        } catch { /* non-blocking */ }
        try {
          const m = document.cookie.match(/(?:^|; )qrix_ref=([a-z0-9]{4,16})/);
          if (m) {
            await fetch("/api/referral/claim", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ code: m[1] }),
            });
            document.cookie = "qrix_ref=; path=/; max-age=0";
          }
        } catch { /* non-blocking */ }
        window.location.replace(next);
      };

      // The client may have already consumed ?code= during init — poll first.
      for (let i = 0; i < 16; i++) {
        const { data } = await supabaseBrowser.auth.getSession();
        if (cancelled) return;
        if (data.session) { await finish(data.session); return; }
        if (i === 3) {
          // Not picked up automatically — exchange explicitly once.
          const code = url.searchParams.get("code");
          if (code) {
            try {
              const { data: ex } = await supabaseBrowser.auth.exchangeCodeForSession(code);
              if (ex?.session) { await finish(ex.session); return; }
            } catch { /* fall through to polling */ }
          }
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      if (!cancelled) setError("Could not complete sign-in. Please try again.");
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <p className="text-[14px] mb-4" style={{ color: "#fca5a5" }}>{error}</p>
          <Link href="/login" className="qx-btn-hero">Back to sign in</Link>
        </>
      ) : (
        <>
          <span className="qx-auth-spin" aria-hidden />
          <p className="mt-4 text-[14px]" style={{ color: "var(--text-muted)" }}>Signing you in…</p>
        </>
      )}
    </main>
  );
}
