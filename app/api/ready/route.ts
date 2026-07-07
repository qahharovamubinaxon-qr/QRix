import { NextResponse } from "next/server";
import { systemHealth } from "@/lib/server/monitor";

export const runtime = "nodejs";

/** Readiness probe — checks every subsystem; 503 until the platform can serve. */
export async function GET() {
  const health = await systemHealth();
  const ready = health.overall !== "down" && health.env.ok;
  return NextResponse.json(
    { ok: ready, overall: health.overall, env: health.env, components: Object.fromEntries(Object.entries(health.components).map(([k, v]) => [k, v.state])) },
    { status: ready ? 200 : 503 },
  );
}
