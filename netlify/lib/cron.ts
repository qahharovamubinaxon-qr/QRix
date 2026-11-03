/* Shared caller for the Netlify Scheduled Functions that replace the three
 * vercel.json crons. Netlify ignores vercel.json, so from the 2 Nov 2026 move
 * until this landed no cron fired at all — the blog autopilot included.
 *
 * Each scheduled function only knocks on the existing /api/cron/* route with
 * the same `Authorization: Bearer <CRON_SECRET>` header Vercel Cron sent, so
 * lib/server/cron-auth.ts needs no change and the routes stay the single place
 * the work happens. CRON_SECRET must be set on Netlify (and the site
 * redeployed — Netlify bakes env into functions at build time); until then
 * every call answers 401, which is logged below rather than hidden.
 *
 * Scheduled functions are cut off at 30 s. The route runs in its own function
 * and keeps going after we stop waiting, so we give up at 25 s and log that
 * instead of failing the schedule. */
export async function callCron(path: string): Promise<Response> {
  const base = process.env.URL || "https://qrixtools.com";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(`[cron] ${path}: CRON_SECRET is not set on Netlify — skipped`);
    return new Response("CRON_SECRET not set", { status: 500 });
  }
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(25_000),
    });
    const body = (await res.text()).slice(0, 500);
    console.log(`[cron] ${path} -> ${res.status} ${body}`);
    return new Response(body, { status: res.ok ? 200 : 502 });
  } catch (e) {
    console.log(`[cron] ${path}: stopped waiting (${(e as Error).name}); the route keeps running`);
    return new Response("dispatched", { status: 202 });
  }
}
