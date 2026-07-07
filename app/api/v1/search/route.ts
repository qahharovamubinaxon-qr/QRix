import { handler, ok, validate } from "@/lib/server/api";
import { db, helpers } from "@/lib/server/db";
import { track } from "@/lib/server/analytics";
import { sanitize } from "@/lib/server/security";

export const runtime = "nodejs";

/** GET — search analytics for the palette: trending queries + popular tools. */
export const GET = handler(async () => {
  const since = helpers.daysAgo(7);
  const queries = new Map<string, number>();
  const tools = new Map<string, number>();
  for (const e of db.events.all()) {
    if (e.createdAt < since) continue;
    if (e.name === "search" && e.tool) queries.set(e.tool, (queries.get(e.tool) || 0) + 1);
    if (e.name === "tool_use" && e.tool && !e.tool.startsWith("ai:")) tools.set(e.tool, (tools.get(e.tool) || 0) + 1);
  }
  const top = (m: Map<string, number>, n: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, count]) => ({ q: k, count }));
  return ok({ trending: top(queries, 6), popular: top(tools, 6) });
}, { rateLimit: { max: 120 } });

/** POST — record a search query (guest-friendly, feeds trending). */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ q: string }>(await req.json(), { q: { type: "string", min: 2, max: 80 } });
  track("search", { userId: user?.id ?? null, tool: sanitize(body.q, 80).toLowerCase() });
  return ok({ recorded: true });
}, { rateLimit: { max: 60 } });
