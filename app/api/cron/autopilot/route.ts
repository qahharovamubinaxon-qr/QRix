import { NextRequest, NextResponse } from "next/server";
import { runAutopilot } from "@/lib/server/autopilot";
import { cronAuthorized } from "@/lib/server/cron-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Autopilot content engine: writes & publishes one SEO article per run.
    CRON_SECRET-protected. Schedule daily (see vercel.json). */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await runAutopilot();
  return NextResponse.json({ ok: result.published, ...result });
}
