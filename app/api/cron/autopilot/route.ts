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

  // Sundays: also dump the persistent tables to the private "backups" bucket
  // (piggybacked here so no extra Vercel cron slot is used).
  let backup: unknown;
  if (new Date().getUTCDay() === 0) {
    try {
      const { backupDatabase } = await import("@/lib/server/backup");
      backup = await backupDatabase();
    } catch { backup = { ok: false, reason: "backup_exception" }; }
  }

  return NextResponse.json({ ok: result.published, ...result, ...(backup ? { backup } : {}) });
}
