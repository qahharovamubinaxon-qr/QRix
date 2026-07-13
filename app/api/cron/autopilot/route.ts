import { NextRequest, NextResponse } from "next/server";
import { runAutopilot } from "@/lib/server/autopilot";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Autopilot content engine: writes & publishes one SEO article per run.
    CRON_SECRET-protected. Schedule daily (see vercel.json). */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await runAutopilot();
  return NextResponse.json({ ok: result.published, ...result });
}
