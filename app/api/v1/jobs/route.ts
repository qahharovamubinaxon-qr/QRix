import { handler, ok, validate, forbidden, pagination, paginate } from "@/lib/server/api";
import { enqueue, listJobs } from "@/lib/server/queue";
import { checkJobQuota } from "@/lib/server/billing";
import { chargeCredits } from "@/lib/server/credits";
import { track } from "@/lib/server/analytics";
import type { JobKind } from "@/lib/server/models";

export const runtime = "nodejs";

export const GET = handler(async ({ req, user }) => {
  const { page, limit, q } = pagination(req);
  let rows = listJobs(user!.id);
  if (q) rows = rows.filter((j) => j.tool.includes(q) || j.status.toLowerCase() === q.toLowerCase());
  return ok(paginate(rows, page, limit));
}, { auth: true });

/** POST — enqueue a background job (image/video/ai/pdf/qr). */
export const POST = handler(async ({ req, user }) => {
  const raw = (await req.json().catch(() => ({}))) as { input?: unknown };
  const body = validate<{ kind: string; tool: string }>(raw, {
    kind: { type: "string", enum: ["IMAGE", "VIDEO", "AI", "PDF", "QR"] },
    tool: { type: "string", min: 1, max: 120 },
  });
  const quota = checkJobQuota(user!.id, user!.plan);
  if (!quota.ok) throw forbidden(`daily job limit reached (${quota.limit})`);
  // Credit engine — meters AI/video jobs; blocks only when CREDITS_ENFORCED=1.
  if (body.kind === "AI" || body.kind === "VIDEO") {
    const charge = chargeCredits(user!.id, body.kind === "AI" ? "ai-text" : "ai-video", user!.plan);
    if (!charge.ok) throw forbidden(`insufficient credits (${charge.balance}/${charge.cost})`);
  }
  // Paid plans get priority processing.
  const job = enqueue(body.kind as JobKind, body.tool, raw.input ?? null, user!.id, user!.plan === "FREE" ? "normal" : "high");
  track("tool_use", { userId: user!.id, tool: body.tool });
  return ok(job);
}, { auth: true, rateLimit: { max: 30 } });
