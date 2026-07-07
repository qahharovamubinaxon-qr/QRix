import { NextRequest, NextResponse } from "next/server";
import { runAiTask } from "@/lib/server/ai/manager";
import { toTaskKind } from "@/lib/server/providers/ai";
import { rateLimit } from "@/lib/server/security";
import { track } from "@/lib/server/analytics";
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

  try {
    const result = await runAiTask(toTaskKind(body.task), input);
    track("tool_use", { tool: `ai:${body.task}` });
    return NextResponse.json({
      ok: true, task: body.task, provider: result.provider, cached: result.cached,
      latencyMs: result.latencyMs, text: result.text, imageUrl: result.imageUrl,
    });
  } catch {
    // No configured provider (or all failed) — client falls back on-device.
    return NextResponse.json({ ok: false, error: "ai_engine_not_configured" }, { status: 503 });
  }
}
