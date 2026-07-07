import { handler, ok, validate } from "@/lib/server/api";
import { track } from "@/lib/server/analytics";

export const runtime = "nodejs";

/** POST — record a product event (tool_use, download, page_view, conversion).
    Works for guests too; userId attaches automatically when signed in. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ name: string; tool?: string }>(await req.json(), {
    name: { type: "string", min: 2, max: 40 },
    tool: { type: "string", optional: true, max: 160 },
  });
  track(body.name, { userId: user?.id ?? null, tool: body.tool ?? null });
  return ok({ tracked: true });
}, { rateLimit: { max: 120 } });
