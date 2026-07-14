import { handler, ok, badRequest } from "@/lib/server/api";
import { enqueue, listJobs } from "@/lib/server/queue";
import { chargeCredits, getAccount, costOf } from "@/lib/server/credits";
import { hasProviderFor } from "@/lib/server/ai/manager";
import { db } from "@/lib/server/db";
import { track } from "@/lib/server/analytics";

export const runtime = "nodejs";

const FREE_GENERATIONS = 3;
const is3d = (tool: string) => /3d/.test(tool);

/** GET — the caller's 3D quota + generation history. */
export const GET = handler(async ({ user }) => {
  const used = db.jobs.count((j) => j.userId === user!.id && is3d(j.tool) && j.status !== "CANCELED" && j.status !== "FAILED");
  return ok({
    freeLimit: FREE_GENERATIONS,
    freeUsed: Math.min(used, FREE_GENERATIONS),
    creditCost: costOf("3d-generate"),
    balance: getAccount(user!.id, user!.plan).balance,
    history: listJobs(user!.id).filter((j) => is3d(j.tool)).slice(0, 20),
  });
}, { auth: true });

/** POST {image} — generate a 3D model from one image.
    First 3 generations are free; afterwards 20 credits each (always enforced). */
export const POST = handler(async ({ req, user }) => {
  const body = (await req.json().catch(() => ({}))) as { image?: string; name?: string };
  if (!body.image || typeof body.image !== "string" || body.image.length > 8_000_000) throw badRequest("image (data-URL or https) required, max ~6MB");

  // Refuse up front when no provider can serve 3d-generate. Without this the job is
  // enqueued, fails, and the user has already been charged 20 credits for nothing —
  // the charge below uses force:true, and nothing refunds a failed 3D job.
  if (!(await hasProviderFor("3d-generate"))) {
    return ok({ error: "engine_not_configured" });
  }

  const used = db.jobs.count((j) => j.userId === user!.id && is3d(j.tool) && j.status !== "CANCELED" && j.status !== "FAILED");
  let charged = 0;
  if (used >= FREE_GENERATIONS) {
    const charge = chargeCredits(user!.id, "3d-generate", user!.plan, { force: true });
    if (!charge.ok) {
      return ok({ error: "insufficient_credits", required: charge.cost, balance: charge.balance, upgrade: "/pricing" });
    }
    charged = charge.cost;
  }

  // Paid plans jump the queue.
  const job = enqueue("AI", "3d-generate", { image: body.image, name: body.name || "model" }, user!.id, user!.plan === "FREE" ? "normal" : "high");
  track("tool_use", { userId: user!.id, tool: "/3d-tools/image-to-3d" });
  return ok({ job, charged, freeRemaining: Math.max(0, FREE_GENERATIONS - used - 1) });
}, { auth: true, rateLimit: { max: 10 }, action: "3d.generate" });
