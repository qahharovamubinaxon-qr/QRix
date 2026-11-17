/**
 * Shared caller for the site's own cron endpoints.
 *
 * The three jobs in vercel.json stopped the day the site moved to Netlify:
 * Vercel Cron called those paths, Netlify has no idea they exist, and nothing
 * replaced it. Nobody noticed for over a week because the jobs fail silently —
 * no posts appear, no report arrives, and neither absence looks like an error.
 *
 * The cost was not only the missed work. Those daily calls were the only thing
 * touching the database, and a free Supabase project pauses after seven idle
 * days. It paused, and with it went every dynamic QR redirect and the blog's
 * rows in the sitemap.
 *
 * The routes are protected by `Authorization: Bearer <CRON_SECRET>` and fail
 * closed in production, so a missing secret here means the job is skipped
 * loudly rather than hitting a 401 every day in silence.
 */
export const callCron = async (path: string) => {
  const base = process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? "https://qrixtools.com";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(`[cron] CRON_SECRET is not set — skipping ${path}`);
    return new Response("CRON_SECRET missing", { status: 500 });
  }
  const url = `${base}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    const ms = Date.now() - started;
    console.log(`[cron] ${path} → ${res.status} in ${ms}ms ${body.slice(0, 300)}`);
    return new Response(body, { status: res.ok ? 200 : 502 });
  } catch (err) {
    console.error(`[cron] ${path} failed`, err);
    return new Response(String(err), { status: 502 });
  }
};
