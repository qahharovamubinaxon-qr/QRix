import { NextRequest, NextResponse } from "next/server";
import { runAiTask } from "@/lib/server/ai/manager";
import { toTaskKind } from "@/lib/server/providers/ai";
import { rateLimit } from "@/lib/server/security";
import { track } from "@/lib/server/analytics";
import { getSession } from "@/lib/server/auth";
import { chargeCredits, refundCredits } from "@/lib/server/credits";
import type { AiInput } from "@/lib/server/ai/providers";

export const runtime = "nodejs";

/**
 * Server side of the QRix AI connector (lib/ai-connector.ts).
 * Every AI tool routes here; the Provider Manager picks the best available
 * provider (free first), falls back on failure and caches where sensible.
 * With zero providers configured it answers 503 so client tools use their
 * on-device fallbacks — exactly the pre-Mission-7 contract.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const rl = await rateLimit(`${ip}:/api/ai/process`, { max: 30 });
  if (!rl.ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let body: { task?: string; payload?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!body.task || typeof body.task !== "string") {
    return NextResponse.json({ ok: false, error: "missing_task" }, { status: 400 });
  }

  const p = body.payload ?? {};
  const input: AiInput = {
    prompt: String(p.prompt ?? p.text ?? ""),
    image: typeof p.image === "string" ? p.image : undefined,
    targetLang: typeof p.targetLang === "string" ? p.targetLang : undefined,
    maxTokens: typeof p.maxTokens === "number" ? Math.min(p.maxTokens, 4096) : undefined,
  };

  const task = toTaskKind(body.task);
  // Credit engine — meters every AI call; blocks only when CREDITS_ENFORCED=1.
  const user = await getSession();
  const creditAction = task === "image-generate" ? "ai-image" : task === "image-analyze" ? "ai-image-analyze" : task === "ocr" ? "ai-ocr" : `ai-${task}`;
  let charged = false;
  if (user) {
    const charge = chargeCredits(user.id, creditAction, user.plan);
    if (!charge.ok) return NextResponse.json({ ok: false, error: "insufficient_credits", balance: charge.balance, cost: charge.cost }, { status: 402 });
    charged = charge.enforced;
  }

  try {
    const result = await runAiTask(task, input);
    track("tool_use", { userId: user?.id, tool: `ai:${body.task}` });
    return NextResponse.json({
      ok: true, task: body.task, provider: result.provider, cached: result.cached,
      latencyMs: result.latencyMs, text: result.text, imageUrl: result.imageUrl,
    });
  } catch {
    if (user && charged) refundCredits(user.id, creditAction); // never charge for failures
    // No configured provider (or all failed) — client falls back on-device.
    return NextResponse.json({ ok: false, error: "ai_engine_not_configured" }, { status: 503 });
  }
}
