import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Liveness probe — cheap, no dependencies touched. */
export async function GET() {
  return NextResponse.json({ ok: true, uptime: Math.round(process.uptime()) });
}
