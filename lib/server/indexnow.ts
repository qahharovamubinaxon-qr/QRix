/* IndexNow — instant URL submission to Bing + Yandex (+ Seznam, Naver).
   The key is public by design: search engines fetch
   https://qrixtools.com/<key>.txt to prove domain ownership (file lives in
   /public). Submitting is free and unlimited; both Bing and Yandex ingest
   IndexNow directly, which replaces manual URL-submission clicking.
   SERVER ONLY (also callable from scripts). */

import { SITE_URL } from "@/lib/seo";

export const INDEXNOW_KEY = "c3bb259476bd7e9b9ddf3123afc412d8";

/** Submit URLs (absolute or site-relative paths) to IndexNow. Max 10k/call. */
export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; submitted: number }> {
  const host = new URL(SITE_URL).host;
  const list = urls
    .map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`))
    .filter((u) => { try { return new URL(u).host === host; } catch { return false; } })
    .slice(0, 10_000);
  if (!list.length) return { ok: false, submitted: 0 };
  try {
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: list }),
      signal: AbortSignal.timeout(20_000),
    });
    // 200 = processed, 202 = accepted for processing — both are success
    return { ok: r.status === 200 || r.status === 202, submitted: list.length };
  } catch {
    return { ok: false, submitted: 0 };
  }
}
