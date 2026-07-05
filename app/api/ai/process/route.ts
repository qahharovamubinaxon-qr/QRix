import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Server side of the QRix AI connector (lib/ai-connector.ts).
 *
 * When a cloud engine is configured (AI_ENGINE_URL + AI_ENGINE_KEY, plus
 * NEXT_PUBLIC_AI_ENGINE=1 so clients know), this route forwards tasks to it.
 * Until then it answers 503 so client tools use their on-device fallbacks.
 */
export async function POST(request: Request) {
  const url = process.env.AI_ENGINE_URL;
  const key = process.env.AI_ENGINE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "ai_engine_not_configured" }, { status: 503 });
  }

  let body: { task?: string; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!body.task || typeof body.task !== "string") {
    return NextResponse.json({ ok: false, error: "missing_task" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ ok: false, error: "engine_unreachable" }, { status: 502 });
  }
}
