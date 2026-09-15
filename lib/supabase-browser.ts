"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/* Built on FIRST USE, not on import — the same fix as lib/supabase.ts.
   ───────────────────────────────────────────────────────────────────────────
   `createBrowserClient()` at module scope throws
   "@supabase/ssr: Your project's URL and API key are required to create a
   Supabase client!" when the env is absent. Next imports this module while
   prerendering every page that pulls in AuthMenu, Sidebar, ReviewsSection and
   the rest — so a missing NEXT_PUBLIC_SUPABASE_URL killed the whole production
   build rather than just the auth UI. It never showed on Vercel, where the env
   was always set; it stopped the Netlify build twice.

   Deferring construction keeps the build independent of any env, and turns the
   failure into a runtime error on the one component that needs auth, naming the
   variable that is missing. The Proxy keeps every `supabaseBrowser.auth…` and
   `supabaseBrowser.from(…)` call site exactly as it was. */
/* Typed as SupabaseClient rather than ReturnType<typeof createBrowserClient>:
   the latter resolves to a loose generic through the Proxy and silently widened
   every `.auth` callback parameter to `any` (11 implicit-any errors across
   TopNav, Sidebar, AuthMenu and friends). */
type BrowserClient = SupabaseClient;

let _client: BrowserClient | null = null;

function client(): BrowserClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  _client = createBrowserClient(url, key);
  return _client;
}

export const supabaseBrowser = new Proxy({} as BrowserClient, {
  get(_target, prop, receiver) {
    const c = client();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
